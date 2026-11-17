import random
import re
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from models.sms_verification import SMSVerification
from config import (
    TWILIO_ACCOUNT_SID, 
    TWILIO_AUTH_TOKEN, 
    TWILIO_PHONE_NUMBER,
    TWILIO_WHATSAPP_NUMBER,
    SMS_CODE_LENGTH,
    SMS_CODE_EXPIRE_MINUTES,
    SMS_MAX_ATTEMPTS,
    APP_NAME
)

def normalize_kg_phone(raw_phone: str) -> str:
    """Преобразует ввод в формат +996XXXXXXXXX (КР). Бросает ValueError если невозможно.

    Правила:
    - Удаляем все нецифры, кроме первого '+' если есть
    - Принимаем варианты: +996XXXXXXXXX, 996XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX
    - Результат всегда: +996 + 9 цифр
    """
    if not raw_phone:
        raise ValueError("Пустой номер телефона")

    digits = re.sub(r"\D", "", raw_phone)

    national_part = ""
    if digits.startswith("996"):
        national_part = digits[3:]
    elif digits.startswith("0") and len(digits) >= 10:
        national_part = digits[1:]
    elif len(digits) == 9:
        national_part = digits
    elif len(digits) == 12 and digits.startswith("996"):
        national_part = digits[3:]
    else:
        # Попробуем взять последние 9 цифр если всего >=9
        if len(digits) >= 9:
            national_part = digits[-9:]
        else:
            raise ValueError("Неверный формат номера телефона")

    if len(national_part) != 9 or not national_part.isdigit():
        raise ValueError("Неверный формат номера телефона")

    return "+996" + national_part

class SMSService:
    def __init__(self):
        self.client = None
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            try:
                self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            except Exception as e:
                print(f"Ошибка инициализации Twilio: {e}")
    
    def generate_code(self) -> str:
        """Генерирует случайный код подтверждения"""
        return ''.join(random.choices(string.digits, k=SMS_CODE_LENGTH))
    
    def send_sms(self, phone: str, code: str) -> bool:
        """Отправляет SMS с кодом подтверждения"""
        print(f"[SMS DEBUG] Попытка отправки SMS на {phone} с кодом {code}")
        
        if not self.client:
            # В режиме разработки просто логируем код
            print(f"[DEV MODE] SMS код для {phone}: {code}")
            return True
        
        try:
            print(f"[SMS DEBUG] Twilio настроен, отправляем SMS...")
            message = self.client.messages.create(
                body=f"Ваш код подтверждения для {APP_NAME}: {code}. Код действителен {SMS_CODE_EXPIRE_MINUTES} минут.",
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            print(f"[SMS SUCCESS] SMS отправлено: {message.sid}")
            return True
        except TwilioException as e:
            print(f"[SMS ERROR] Ошибка отправки SMS: {e}")
            return False
        except Exception as e:
            print(f"[SMS ERROR] Неожиданная ошибка: {e}")
            return False

    def send_whatsapp(self, phone: str, code: str) -> bool:
        """Отправляет WhatsApp сообщение с кодом подтверждения"""
        print(f"[WA DEBUG] Попытка отправки WhatsApp на {phone} с кодом {code}")

        if not self.client or not TWILIO_WHATSAPP_NUMBER:
            # В dev-режиме просто логируем код
            print(f"[DEV MODE] WhatsApp код для {phone}: {code}")
            return True

        try:
            print(f"[WA DEBUG] Twilio настроен, отправляем WhatsApp...")
            message = self.client.messages.create(
                body=f"Ваш код подтверждения для {APP_NAME}: {code}. Код действителен {SMS_CODE_EXPIRE_MINUTES} минут.",
                from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
                to=f"whatsapp:{phone}"
            )
            print(f"[WA SUCCESS] WhatsApp отправлено: {message.sid}")
            return True
        except TwilioException as e:
            print(f"[WA ERROR] Ошибка отправки WhatsApp: {e}")
            return False
        except Exception as e:
            print(f"[WA ERROR] Неожиданная ошибка: {e}")
            return False
    
    def create_verification_record(self, db: Session, phone: str) -> SMSVerification:
        """Создает запись верификации в базе данных"""
        # Удаляем старые записи для этого номера
        db.query(SMSVerification).filter(
            SMSVerification.phone == phone
        ).delete()
        
        code = self.generate_code()
        expires_at = datetime.utcnow() + timedelta(minutes=SMS_CODE_EXPIRE_MINUTES)
        
        verification = SMSVerification(
            phone=phone,
            code=code,
            expires_at=expires_at
        )
        
        db.add(verification)
        db.commit()
        db.refresh(verification)
        
        return verification
    
    def verify_code(self, db: Session, phone: str, code: str) -> bool:
        """Проверяет код подтверждения"""
        verification = db.query(SMSVerification).filter(
            SMSVerification.phone == phone,
            SMSVerification.is_verified == False
        ).first()
        
        if not verification:
            return False
        
        if verification.is_expired():
            return False
        
        if verification.attempts >= SMS_MAX_ATTEMPTS:
            return False
        
        verification.attempts += 1
        
        if verification.code == code:
            verification.is_verified = True
            db.commit()
            return True
        
        db.commit()
        return False
    
    def get_verification_status(self, db: Session, phone: str) -> SMSVerification:
        """Получает статус верификации для номера"""
        return db.query(SMSVerification).filter(
            SMSVerification.phone == phone
        ).first()

# Глобальный экземпляр сервиса
sms_service = SMSService()
