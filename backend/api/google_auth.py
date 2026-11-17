from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Body
from sqlalchemy.orm import Session
from google.auth.transport import requests
from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError
from database import get_db
from models.user import User
from schemas.user import UserResponse
from config import GOOGLE_CLIENT_ID, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import datetime, timedelta
from jose import JWTError, jwt
import requests as http_requests

router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Создает JWT токен"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def get_user_by_email(db: Session, email: str):
    """Получает пользователя по email"""
    return db.query(User).filter(User.email == email).first()

@router.post("/google-auth")
async def google_auth(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Аутентификация через Google"""
    
    try:
        if not isinstance(payload, dict) or 'token' not in payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Отсутствует поле 'token' в теле запроса"
            )

        token = payload['token']
        # Верификация токена Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Проверяем аудиторию токена
        if idinfo['aud'] != GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный токен Google"
            )
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        # Проверяем, существует ли пользователь
        user = get_user_by_email(db, email)
        
        if not user:
            # Создаем нового пользователя
            user = User(
                email=email,
                full_name=name,
                google_id=idinfo['sub'],
                profile_picture=picture,
                is_verified=True  # Google уже верифицировал email
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Создаем JWT токен
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user": UserResponse.from_orm(user)
        }
        
    except GoogleAuthError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка верификации Google токена: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка: {str(e)}"
        )

@router.get("/google-login-url")
async def get_google_login_url():
    """Получает URL для входа через Google"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth не настроен"
        )
    
    # Для мобильного приложения используем Google Sign-In SDK
    # Этот endpoint возвращает конфигурацию для фронтенда
    return {
        "client_id": GOOGLE_CLIENT_ID,
        "message": "Используйте Google Sign-In SDK в мобильном приложении"
    }
