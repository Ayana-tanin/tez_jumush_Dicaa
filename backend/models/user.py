from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=True)  # Может быть null для Google auth
    email = Column(String, unique=True, index=True, nullable=True)  # Для Google auth
    full_name = Column(String, nullable=False)
    google_id = Column(String, unique=True, index=True, nullable=True)  # Google ID
    profile_picture = Column(String, nullable=True)  # URL к фото профиля Google
    passport_series = Column(String, nullable=True)  # Опционально для Google auth
    passport_number = Column(String, nullable=True)
    passport_issued_by = Column(String, nullable=True)
    passport_date = Column(String, nullable=True)
    passport_front = Column(String)  # URL к фото паспорта (лицевая сторона)
    passport_back = Column(String)   # URL к фото паспорта (обратная сторона)
    avatar = Column(String)          # URL к аватару
    rating = Column(Float, default=5.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    tasks = relationship("Task", back_populates="user")
