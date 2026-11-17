from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

class SMSVerification(Base):
    __tablename__ = "sms_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    def is_expired(self):
        """Проверяет, истек ли срок действия кода"""
        from datetime import datetime
        return datetime.utcnow() > self.expires_at
