import re
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from config import (
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID
)

def normalize_kg_phone(raw_phone: str) -> str:
    """Преобразует ввод в формат +996XXXXXXXXX (КР). Бросает ValueError если невозможно."""
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
        if len(digits) >= 9:
            national_part = digits[-9:]
        else:
            raise ValueError("Неверный формат номера телефона")

    if len(national_part) != 9 or not national_part.isdigit():
        raise ValueError("Неверный формат номера телефона")

    return "+996" + national_part


class TwilioVerifyService:
    """Сервис для работы с Twilio Verify API"""
    
    def __init__(self):
        self.client = None
        self.service_sid = TWILIO_VERIFY_SERVICE_SID
        
        print(f"[Twilio Init] Account SID: {TWILIO_ACCOUNT_SID[:10]}..." if TWILIO_ACCOUNT_SID else "[Twilio Init] Account SID: НЕ УСТАНОВЛЕН")
        print(f"[Twilio Init] Auth Token: {'УСТАНОВЛЕН' if TWILIO_AUTH_TOKEN else 'НЕ УСТАНОВЛЕН'}")
        print(f"[Twilio Init] Service SID: {self.service_sid}")
        
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            try:
                self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                print(f"[Twilio Init] ✅ Twilio клиент успешно инициализирован")
            except Exception as e:
                print(f"[Twilio Init] ❌ Ошибка инициализации Twilio: {e}")
        else:
            print(f"[Twilio Init] ⚠️ Twilio не настроен: отсутствуют учетные данные")
    
    def send_verification_code(self, phone: str, channel: str = "sms") -> dict:
        """
        Отправляет код подтверждения через Twilio Verify API
        
        Args:
            phone: Номер телефона в формате +996XXXXXXXXX
            channel: Канал отправки - 'sms' или 'whatsapp'
        
        Returns:
            dict: {'success': bool, 'message': str, 'sid': str}
        """
        if not self.client:
            return {
                'success': False,
                'message': 'Twilio не настроен',
                'sid': None
            }
        
        # Twilio Verify API поддерживает только 'sms' или 'whatsapp'
        if channel not in ['sms', 'whatsapp']:
            channel = 'sms'
        
        try:
            print(f"[Twilio Verify] Отправка кода на {phone} через {channel}...")
            print(f"[Twilio Verify] Service SID: {self.service_sid}")
            
            verification = self.client.verify.v2.services(
                self.service_sid
            ).verifications.create(
                to=phone,
                channel=channel
            )
            
            print(f"[Twilio Verify] ✅ Код отправлен на {phone} через {channel}")
            print(f"[Twilio Verify] Verification SID: {verification.sid}")
            print(f"[Twilio Verify] Status: {verification.status}")
            
            return {
                'success': True,
                'message': f'Код подтверждения отправлен на {phone}',
                'sid': verification.sid
            }
            
        except TwilioException as e:
            print(f"[Twilio Verify ERROR] ❌ Ошибка отправки кода: {e}")
            print(f"[Twilio Verify ERROR] Тип ошибки: {type(e).__name__}")
            print(f"[Twilio Verify ERROR] Код ошибки: {getattr(e, 'code', 'N/A')}")
            return {
                'success': False,
                'message': f'Ошибка отправки кода: {str(e)}',
                'sid': None
            }
        except Exception as e:
            print(f"[Twilio Verify ERROR] ❌ Неожиданная ошибка: {e}")
            print(f"[Twilio Verify ERROR] Тип ошибки: {type(e).__name__}")
            return {
                'success': False,
                'message': f'Неожиданная ошибка: {str(e)}',
                'sid': None
            }
    
    def verify_code(self, phone: str, code: str) -> dict:
        """
        Проверяет код подтверждения через Twilio Verify API
        
        Args:
            phone: Номер телефона в формате +996XXXXXXXXX
            code: Код подтверждения
        
        Returns:
            dict: {'success': bool, 'verified': bool, 'message': str}
        """
        if not self.client:
            return {
                'success': False,
                'verified': False,
                'message': 'Twilio не настроен'
            }
        
        try:
            print(f"[Twilio Verify] Проверка кода для {phone}...")
            print(f"[Twilio Verify] Service SID: {self.service_sid}")
            
            verification_check = self.client.verify.v2.services(
                self.service_sid
            ).verification_checks.create(
                to=phone,
                code=code
            )
            
            # Логируем полный ответ от Twilio для отладки
            print(f"[Twilio Verify] Response status: {verification_check.status}")
            print(f"[Twilio Verify] Response valid: {getattr(verification_check, 'valid', 'N/A')}")
            print(f"[Twilio Verify] Response sid: {verification_check.sid}")
            print(f"[Twilio Verify] Response channel: {getattr(verification_check, 'channel', 'N/A')}")
            
            # Проверяем оба поля: status и valid для надежности
            # status может быть: 'approved', 'pending', 'canceled', 'expired'
            # valid - это boolean поле, которое указывает на успешную проверку
            status_approved = verification_check.status == 'approved'
            is_valid = getattr(verification_check, 'valid', False)
            
            # Код считается подтвержденным, если status == 'approved' И valid == True
            is_verified = status_approved and is_valid
            
            if is_verified:
                print(f"[Twilio Verify] ✅ Номер {phone} успешно подтвержден (status: {verification_check.status}, valid: {is_valid})")
                return {
                    'success': True,
                    'verified': True,
                    'message': 'Номер телефона успешно подтвержден'
                }
            else:
                # Детальная информация о причине отказа
                status = verification_check.status
                valid = getattr(verification_check, 'valid', False)
                
                if status == 'pending':
                    message = 'Код еще не подтвержден или неверный'
                elif status == 'expired':
                    message = 'Срок действия кода истек'
                elif status == 'canceled':
                    message = 'Проверка кода была отменена'
                else:
                    message = f'Неверный код подтверждения (статус: {status})'
                
                print(f"[Twilio Verify] ❌ Код не подтвержден для {phone}. Статус: {status}, valid: {valid}")
                return {
                    'success': True,
                    'verified': False,
                    'message': message
                }
                
        except TwilioException as e:
            print(f"[Twilio Verify ERROR] ❌ Ошибка проверки кода: {e}")
            print(f"[Twilio Verify ERROR] Тип ошибки: {type(e).__name__}")
            print(f"[Twilio Verify ERROR] Код ошибки: {getattr(e, 'code', 'N/A')}")
            return {
                'success': False,
                'verified': False,
                'message': f'Ошибка проверки кода: {str(e)}'
            }
        except Exception as e:
            print(f"[Twilio Verify ERROR] ❌ Неожиданная ошибка при проверке кода: {e}")
            print(f"[Twilio Verify ERROR] Тип ошибки: {type(e).__name__}")
            return {
                'success': False,
                'verified': False,
                'message': f'Неожиданная ошибка: {str(e)}'
            }


# Глобальный экземпляр сервиса
twilio_verify_service = TwilioVerifyService()
