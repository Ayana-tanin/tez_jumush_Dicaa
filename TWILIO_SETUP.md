# Настройка Twilio Verify API

## Интеграция завершена! ✅

Twilio Verify API интегрирован в приложение для отправки кодов подтверждения через SMS и WhatsApp.

## Настройка Backend

### 1. Добавьте переменные окружения в `.env` файл:

```env
# Twilio Account Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# Twilio Verify Service SID
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Важно:** Замените `your_auth_token_here` на ваш реальный Auth Token из Twilio Console.

### 2. Где найти Auth Token:

1. Войдите в [Twilio Console](https://console.twilio.com/)
2. Перейдите в настройки аккаунта
3. Найдите "Auth Token" в разделе "Account Credentials"
4. Скопируйте токен и вставьте в `.env` файл

## Как это работает

### Flow регистрации:

1. **Заполнение формы** → Пользователь заполняет данные регистрации
2. **Выбор канала** → Пользователь выбирает SMS или WhatsApp
3. **Отправка кода** → Backend отправляет код через Twilio Verify API
4. **Ввод кода** → Пользователь вводит 6-значный код
5. **Проверка** → Backend проверяет код через Twilio Verify API
6. **Завершение** → После успешной проверки регистрация завершается

### API Endpoints:

#### Отправка кода:
```http
POST /sms/send-code
Content-Type: application/json

{
  "phone": "+996XXXXXXXXX",
  "channel": "sms"  // или "whatsapp"
}
```

#### Проверка кода:
```http
POST /sms/verify-code
Content-Type: application/json

{
  "phone": "+996XXXXXXXXX",
  "code": "123456"
}
```

## Особенности Twilio Verify API

### Преимущества:
- ✅ Автоматическая генерация кодов (не нужно хранить в БД)
- ✅ Встроенная защита от брутфорса
- ✅ Автоматическое управление временем жизни кодов
- ✅ Поддержка SMS и WhatsApp из коробки
- ✅ Надежная доставка сообщений

### Каналы отправки:
- **SMS**: Стандартная отправка через SMS
- **WhatsApp**: Отправка через WhatsApp (требует настройки в Twilio)

### Формат номера телефона:
Номера автоматически нормализуются в формат `+996XXXXXXXXX` (Кыргызстан).

## Тестирование

### 1. Проверьте подключение к Twilio:

```bash
# В backend директории
python -c "from core.twilio_verify import twilio_verify_service; print(twilio_verify_service.client)"
```

### 2. Тест отправки кода:

```bash
curl -X POST http://localhost:8000/sms/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+996XXXXXXXXX", "channel": "sms"}'
```

### 3. Тест проверки кода:

```bash
curl -X POST http://localhost:8000/sms/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+996XXXXXXXXX", "code": "123456"}'
```

## Troubleshooting

### Ошибка: "Twilio не настроен"
- Проверьте, что `TWILIO_ACCOUNT_SID` и `TWILIO_AUTH_TOKEN` установлены в `.env`
- Убедитесь, что `.env` файл загружается (проверьте `load_dotenv()` в `config.py`)

### Ошибка: "Invalid phone number"
- Убедитесь, что номер в формате `+996XXXXXXXXX`
- Проверьте, что номер начинается с `+996`

### Ошибка: "Service not found"
- Проверьте, что `TWILIO_VERIFY_SERVICE_SID` правильный
- Убедитесь, что Service существует в вашем Twilio аккаунте

### WhatsApp не работает:
- Убедитесь, что WhatsApp канал активирован в Twilio Verify Service
- Проверьте настройки WhatsApp в Twilio Console

## Безопасность

⚠️ **Важно:**
- Никогда не коммитьте `.env` файл в Git
- Храните Auth Token в секрете
- Используйте разные токены для dev и production
- Регулярно ротируйте токены

## Стоимость

Twilio Verify API тарифицируется по количеству отправленных кодов:
- SMS: ~$0.05 за код
- WhatsApp: ~$0.005 за код (дешевле!)

Проверьте актуальные тарифы на [Twilio Pricing](https://www.twilio.com/pricing)

## Дополнительная информация

- [Twilio Verify API Documentation](https://www.twilio.com/docs/verify/api)
- [Twilio Verify Service Setup](https://www.twilio.com/docs/verify/quickstart)
- [WhatsApp Setup Guide](https://www.twilio.com/docs/whatsapp)
