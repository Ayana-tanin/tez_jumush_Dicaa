from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from database import get_db
from models.user import User
from core.sms import normalize_kg_phone
from models.sms_verification import SMSVerification
from schemas.user import UserCreate, UserLogin, UserResponse
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

security = HTTPBearer()

router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone == phone).first()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли пользователь
    try:
        normalized_phone = normalize_kg_phone(user.phone)
    except Exception:
        raise HTTPException(status_code=400, detail="Неверный формат номера. Используйте +996XXXXXXXXX")
    db_user = get_user_by_phone(db, phone=normalized_phone)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким номером телефона уже зарегистрирован"
        )
    
    # ОТКЛЮЧЕНО: Проверка подтверждения номера телефона через SMS
    # verification = db.query(SMSVerification).filter(
    #     SMSVerification.phone == normalized_phone,
    #     SMSVerification.is_verified == True
    # ).first()
    
    # if not verification:
    #     raise HTTPException(
    #         status_code=400,
    #         detail="Номер телефона не подтвержден. Сначала подтвердите номер через SMS"
    #     )
    
    # Создаем нового пользователя
    db_user = User(
        phone=normalized_phone,
        full_name=user.full_name,
        passport_series=user.passport_series,
        passport_number=user.passport_number,
        passport_issued_by=user.passport_issued_by,
        passport_date=user.passport_date
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # ОТКЛЮЧЕНО: Проверка подтверждения номера телефона через SMS
    try:
        normalized_phone = normalize_kg_phone(user_credentials.phone)
    except Exception:
        raise HTTPException(status_code=400, detail="Неверный формат номера. Используйте +996XXXXXXXXX")
    
    # verification = db.query(SMSVerification).filter(
    #     SMSVerification.phone == normalized_phone,
    #     SMSVerification.is_verified == True
    # ).first()
    
    # if not verification:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Номер телефона не подтвержден. Сначала подтвердите номер через SMS"
    #     )
    
    user = get_user_by_phone(db, phone=normalized_phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден. Зарегистрируйтесь сначала"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    print(f"[AUTH DEBUG] Получен токен: {token[:20]}...")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None:
            print("[AUTH ERROR] Токен не содержит phone (sub)")
            raise credentials_exception
        print(f"[AUTH DEBUG] Декодирован phone: {phone}")
    except JWTError as e:
        print(f"[AUTH ERROR] Ошибка декодирования токена: {e}")
        raise credentials_exception
    
    user = get_user_by_phone(db, phone=phone)
    if user is None:
        print(f"[AUTH ERROR] Пользователь с phone {phone} не найден")
        raise credentials_exception
    
    print(f"[AUTH SUCCESS] Пользователь найден: ID={user.id}, phone={user.phone}")
    return user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
