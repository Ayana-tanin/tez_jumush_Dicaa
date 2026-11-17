#!/usr/bin/env python3
"""
Тестовый скрипт для проверки SMS функциональности
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.sms import sms_service
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

def test_sms_service():
    print("=== Тест SMS сервиса ===")
    
    # Проверяем конфигурацию
    print(f"TWILIO_ACCOUNT_SID: {'Настроен' if TWILIO_ACCOUNT_SID else 'Не настроен'}")
    print(f"TWILIO_AUTH_TOKEN: {'Настроен' if TWILIO_AUTH_TOKEN else 'Не настроен'}")
    print(f"TWILIO_PHONE_NUMBER: {TWILIO_PHONE_NUMBER or 'Не настроен'}")
    
    # Тестируем генерацию кода
    code = sms_service.generate_code()
    print(f"Сгенерированный код: {code}")
    print(f"Длина кода: {len(code)}")
    
    # Тестируем отправку SMS
    test_phone = "+996555123456"
    print(f"\nТестируем отправку SMS на {test_phone}")
    
    result = sms_service.send_sms(test_phone, code)
    print(f"Результат отправки: {'Успешно' if result else 'Ошибка'}")
    
    print("\n=== Тест завершен ===")

if __name__ == "__main__":
    test_sms_service()
