# 📡 API Документация Tez Jumush

## 🔐 Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <your-jwt-token>
```

## 👤 Аутентификация

### Регистрация
```http
POST /auth/register
Content-Type: application/json

{
  "phone": "+996700123456",
  "full_name": "Иван Иванов",
  "password": "secure_password"
}
```

**Ответ:**
```json
{
  "id": 1,
  "phone": "+996700123456",
  "full_name": "Иван Иванов",
  "avatar": null,
  "rating": 5.0,
  "is_verified": false,
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Вход
```http
POST /auth/login
Content-Type: application/json

{
  "phone": "+996700123456",
  "password": "secure_password"
}
```

**Ответ:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "phone": "+996700123456",
    "full_name": "Иван Иванов",
    "avatar": null,
    "rating": 5.0,
    "is_verified": false,
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### Получение профиля
```http
GET /auth/me
Authorization: Bearer <token>
```

## 📋 Задачи

### Получение списка задач
```http
GET /tasks/?skip=0&limit=20&price_min=100&price_max=5000
```

**Параметры:**
- `skip` - количество пропущенных записей (по умолчанию 0)
- `limit` - максимальное количество записей (по умолчанию 100)
- `price_min` - минимальная цена
- `price_max` - максимальная цена

**Ответ:**
```json
[
  {
    "id": 1,
    "title": "Помощь с переездом",
    "description": "Нужна помощь с переездом квартиры",
    "price": 2000,
    "count_people": 2,
    "date": "2024-01-15",
    "time": "10:00:00",
    "address": "ул. Чуй, 123",
    "latitude": 42.8746,
    "longitude": 74.5998,
    "user_id": 1,
    "status": "active",
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

### Поиск задач поблизости
```http
GET /tasks/nearby?lat=42.8746&lon=74.5998&radius=5.0
```

**Параметры:**
- `lat` - широта (обязательно)
- `lon` - долгота (обязательно)
- `radius` - радиус поиска в километрах (по умолчанию 5.0)

### Получение задачи по ID
```http
GET /tasks/1
```

### Создание задачи
```http
POST /tasks/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Помощь с переездом",
  "description": "Нужна помощь с переездом квартиры",
  "price": 2000,
  "count_people": 2,
  "date": "2024-01-15",
  "time": "10:00:00",
  "address": "ул. Чуй, 123",
  "latitude": 42.8746,
  "longitude": 74.5998
}
```

### Обновление задачи
```http
PUT /tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Помощь с переездом (обновлено)",
  "price": 2500
}
```

### Удаление задачи
```http
DELETE /tasks/1
Authorization: Bearer <token>
```

## 👤 Пользователи

### Получение профиля
```http
GET /users/me
Authorization: Bearer <token>
```

### Обновление профиля
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Иван Петров",
  "avatar": "https://example.com/avatar.jpg"
}
```

## 💬 Чаты

### Получение сообщений
```http
GET /chats/?task_id=1
Authorization: Bearer <token>
```

**Ответ:**
```json
[
  {
    "id": 1,
    "text": "Привет! Интересует ваша задача",
    "task_id": 1,
    "sender_id": 2,
    "receiver_id": 1,
    "timestamp": "2024-01-01T12:00:00Z",
    "is_read": false
  }
]
```

### Отправка сообщения
```http
POST /chats/
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Привет! Интересует ваша задача",
  "task_id": 1,
  "receiver_id": 1
}
```

## 🆘 Поддержка

### Отправка обращения
```http
POST /support/
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Проблема с приложением",
  "message": "Не могу загрузить фото паспорта",
  "email": "user@example.com"
}
```

**Ответ:**
```json
{
  "message": "Ваше обращение отправлено в службу поддержки",
  "request_id": "REQ-1-A1B2C3D4",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "sent"
}
```

**Примечание:** Обращение автоматически отправляется на email адреса поддержки:
- support@example.com
- support2@example.com

## 📊 Коды ответов

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `422` - Ошибка валидации
- `500` - Внутренняя ошибка сервера

## 🔍 Примеры ошибок

### Ошибка валидации
```json
{
  "detail": [
    {
      "loc": ["body", "phone"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Ошибка авторизации
```json
{
  "detail": "Неверный номер телефона или пароль"
}
```

### Ресурс не найден
```json
{
  "detail": "Задача не найдена"
}
```

## 🧪 Тестирование API

### Swagger UI
После запуска сервера откройте: http://localhost:8000/docs

### Postman коллекция
Создайте коллекцию в Postman с примерами запросов выше.

### cURL примеры

**Регистрация:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+996700123456",
    "full_name": "Иван Иванов",
    "password": "secure_password"
  }'
```

**Вход:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+996700123456",
    "password": "secure_password"
  }'
```

**Получение задач:**
```bash
curl -X GET "http://localhost:8000/tasks/" \
  -H "Authorization: Bearer <your-token>"
```

## 🔒 Безопасность

1. **JWT токены** - используются для аутентификации
2. **HTTPS** - обязательно в продакшене
3. **Валидация данных** - все входные данные проверяются
4. **Хеширование паролей** - пароли хранятся в хешированном виде
5. **CORS** - настроен для работы с мобильным приложением

## 📈 Лимиты и ограничения

- Максимальный размер файла: 10MB
- Максимальная длина сообщения: 1000 символов
- Лимит запросов: 100 запросов в минуту на IP
- Время жизни токена: 30 минут
