from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from api.auth import get_current_user
from models.user import User
from core.email import send_support_email
import uuid
from datetime import datetime

router = APIRouter()

class SupportRequest(BaseModel):
    subject: str
    message: str
    email: Optional[str] = None

@router.post("/")
async def send_support_request(
    request: SupportRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Отправляет обращение в службу поддержки
    """
    try:
        # Генерируем уникальный ID запроса
        request_id = f"REQ-{current_user.id}-{uuid.uuid4().hex[:8].upper()}"
        
        # Отправляем email в службу поддержки
        email_sent = await send_support_email(
            subject=request.subject,
            message=request.message,
            user_email=request.email or current_user.phone,  # Используем телефон если email не указан
            user_name=current_user.full_name
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=500,
                detail="Ошибка отправки обращения. Попробуйте позже."
            )
        
        return {
            "message": "Ваше обращение отправлено в службу поддержки",
            "request_id": request_id,
            "timestamp": datetime.now().isoformat(),
            "status": "sent"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка обработки запроса: {str(e)}"
        )
