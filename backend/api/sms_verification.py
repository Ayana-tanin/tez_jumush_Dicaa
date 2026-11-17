from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from core.twilio_verify import twilio_verify_service, normalize_kg_phone
from schemas.sms_verification import (
    SMSVerificationRequest, 
    SMSVerificationConfirm, 
    SMSVerificationResponse,
    SMSVerificationStatus
)
from config import SMS_CODE_EXPIRE_MINUTES

router = APIRouter()

@router.post("/send-code", response_model=SMSVerificationResponse)
async def send_verification_code(
    request: SMSVerificationRequest, 
    db: Session = Depends(get_db)
):
    """Отправляет код подтверждения через Twilio Verify API (SMS или WhatsApp)"""
    
    print(f"[API DEBUG] ========== ОТПРАВКА КОДА ==========")
    print(f"[API DEBUG] Получен запрос на отправку кода: {request.phone}, канал: {request.channel}")
    print(f"[API DEBUG] Twilio клиент инициализирован: {twilio_verify_service.client is not None}")
    print(f"[API DEBUG] Service SID: {twilio_verify_service.service_sid}")
    
    # Проверяем формат номера телефона
    try:
        phone = normalize_kg_phone(request.phone)
        print(f"[API DEBUG] Номер нормализован: {phone}")
    except ValueError as e:
        print(f"[API ERROR] Ошибка нормализации номера: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неверный формат номера телефона: {str(e)}. Используйте +996XXXXXXXXX"
        )
    
    # Валидация канала
    channel = request.channel.lower() if request.channel else "sms"
    if channel not in ['sms', 'whatsapp']:
        channel = 'sms'
    
    print(f"[API DEBUG] Используемый канал: {channel}")
    
    # Отправляем код через Twilio Verify API
    print(f"[API DEBUG] Вызов twilio_verify_service.send_verification_code...")
    result = twilio_verify_service.send_verification_code(phone, channel)
    print(f"[API DEBUG] Результат отправки: {result}")
    
    if result['success']:
        print(f"[API SUCCESS] ✅ Код успешно отправлен на {phone} через {channel}")
        return SMSVerificationResponse(
            message=f"Код подтверждения отправлен на ваш номер телефона через {channel.upper()}",
            expires_in_minutes=SMS_CODE_EXPIRE_MINUTES
        )
    else:
        print(f"[API ERROR] ❌ Ошибка отправки кода для {phone}: {result['message']}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message'] or "Ошибка отправки кода. Проверьте настройки Twilio в .env файле"
        )

@router.post("/verify-code")
async def verify_code(
    request: SMSVerificationConfirm,
    db: Session = Depends(get_db)
):
    """Проверяет код подтверждения через Twilio Verify API"""
    
    try:
        phone = normalize_kg_phone(request.phone)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат номера телефона. Используйте +996XXXXXXXXX"
        )
    
    code = request.code.strip()
    
    if not code or not code.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Код должен содержать только цифры"
        )
    
    # Проверяем код через Twilio Verify API
    result = twilio_verify_service.verify_code(phone, code)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message'] or "Ошибка проверки кода"
        )
    
    if result['verified']:
        return {
            "message": "Номер телефона успешно подтвержден",
            "verified": True
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result['message'] or "Неверный код подтверждения"
        )

@router.get("/status/{phone}", response_model=SMSVerificationStatus)
async def get_verification_status(
    phone: str,
    db: Session = Depends(get_db)
):
    """Получает статус верификации номера телефона"""
    
    try:
        phone = normalize_kg_phone(phone)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат номера телефона. Используйте +996XXXXXXXXX"
        )
    
    # Twilio Verify API не предоставляет статус напрямую
    # Возвращаем базовый статус
    return SMSVerificationStatus(
        is_verified=False,
        attempts_left=3  # Twilio Verify имеет свои лимиты
    )
