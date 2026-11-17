from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
import re

class UserBase(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    full_name: str

class UserCreate(UserBase):
    passport_series: Optional[str] = None
    passport_number: Optional[str] = None
    passport_issued_by: Optional[str] = None
    passport_date: Optional[str] = None

    @validator('passport_series')
    def validate_passport_series(cls, v):
        if v is not None and not re.match(r'^\d{7}$', v):
            raise ValueError('Серия паспорта должна содержать ровно 7 цифр')
        return v

    @validator('passport_number')
    def validate_passport_number(cls, v):
        if v is not None and not re.match(r'^\d{14}$', v):
            raise ValueError('Номер паспорта (ИНН) должен содержать ровно 14 цифр')
        return v

    @validator('passport_issued_by')
    def validate_passport_issued_by(cls, v):
        if v is not None and len(v) > 11:
            raise ValueError('Кем выдан не должен превышать 11 символов')
        return v

    @validator('passport_date')
    def validate_passport_date(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%d.%m.%Y')
            except ValueError:
                raise ValueError('Дата должна быть в формате ДД.ММ.ГГГГ')
        return v

class UserLogin(BaseModel):
    phone: str

class UserResponse(UserBase):
    id: int
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    avatar: Optional[str] = None
    rating: float
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None
