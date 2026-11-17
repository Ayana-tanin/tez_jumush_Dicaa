from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SMSVerificationRequest(BaseModel):
    phone: str
    channel: str = "sms"  # "sms" или "whatsapp"

class SMSVerificationConfirm(BaseModel):
    phone: str
    code: str

class SMSVerificationResponse(BaseModel):
    message: str
    expires_in_minutes: int = 5

class SMSVerificationStatus(BaseModel):
    is_verified: bool
    attempts_left: int
    expires_at: Optional[datetime] = None
