# Техническое задание - Tez Jumush

## Общее описание проекта

**Tez Jumush** - мобильное приложение для поиска и выполнения быстрых задач и подработок в Кыргызстане. Платформа соединяет работодателей с исполнителями для выполнения различных задач.

## Архитектура системы

### Backend (FastAPI + PostgreSQL)
- **Язык:** Python 3.8+
- **Фреймворк:** FastAPI
- **База данных:** PostgreSQL 13+
- **ORM:** SQLAlchemy
- **Аутентификация:** JWT токены
- **SMS:** Twilio (с режимом разработки)
- **Файлы:** Cloudinary

### Frontend (React Native + Expo)
- **Язык:** JavaScript/React Native
- **Фреймворк:** Expo
- **Навигация:** React Navigation
- **Карты:** React Native Maps
- **Состояние:** AsyncStorage
- **HTTP:** Fetch API

## Основные функции

### 1. Система аутентификации
- **Регистрация с SMS верификацией:**
  - Ввод номера телефона (+996)
  - Отправка SMS кода (4 цифры, 5 минут)
  - Подтверждение кода
  - Заполнение паспортных данных
  - Создание аккаунта

- **Вход в систему:**
  - Ввод номера телефона
  - SMS верификация
  - Автоматический вход

### 2. Управление задачами
- **Создание задач:**
  - Название и описание
  - Цена в сомах
  - Количество людей
  - Дата и время
  - Адрес и координаты
  - Статус (активная/завершенная/отмененная)

- **Просмотр задач:**
  - Список всех активных задач
  - Фильтрация по цене, дате
  - Поиск по названию
  - Детальная информация о задаче

- **Геолокация:**
  - Карта с маркерами задач
  - Поиск задач поблизости
  - Автоматическое определение местоположения

### 3. Система чатов
- **Real-time общение:**
  - WebSocket соединения
  - Обмен сообщениями между пользователями
  - История переписок
  - Статус прочтения

### 4. Профиль пользователя
- **Личная информация:**
  - ФИО
  - Паспортные данные
  - Рейтинг
  - История выполненных задач

## Модели данных

### User (Пользователь)
```python
- id: Integer (PK)
- phone: String (уникальный)
- full_name: String
- passport_series: String (7 цифр)
- passport_number: String (14 цифр)
- passport_issued_by: String (до 11 символов)
- passport_date: Date
- rating: Float
- created_at: DateTime
```

### Task (Задача)
```python
- id: Integer (PK)
- title: String
- description: Text
- price: Integer (в сомах)
- count_people: Integer
- date: Date
- time: Time
- address: String
- latitude: Float
- longitude: Float
- user_id: Integer (FK)
- status: String (active/completed/cancelled)
- created_at: DateTime
```

### SMSVerification (SMS верификация)
```python
- id: Integer (PK)
- phone: String
- code: String (4 цифры)
- is_verified: Boolean
- attempts: Integer
- expires_at: DateTime
- created_at: DateTime
```

### Message (Сообщение)
```python
- id: Integer (PK)
- sender_id: Integer (FK)
- receiver_id: Integer (FK)
- task_id: Integer (FK)
- text: Text
- is_read: Boolean
- timestamp: DateTime
```

## API Endpoints

### Аутентификация
- `POST /auth/register` - регистрация пользователя
- `POST /auth/login` - вход в систему
- `GET /auth/me` - получение текущего пользователя

### SMS верификация
- `POST /sms/send-code` - отправка SMS кода
- `POST /sms/verify-code` - проверка SMS кода
- `GET /sms/status/{phone}` - статус верификации

### Задачи
- `GET /tasks/` - список задач с фильтрацией
- `GET /tasks/nearby` - задачи поблизости
- `GET /tasks/{id}` - детали задачи
- `POST /tasks/` - создание задачи
- `PUT /tasks/{id}` - редактирование задачи
- `DELETE /tasks/{id}` - удаление задачи

### Пользователи
- `GET /users/phone/{phone}` - поиск по номеру телефона
- `GET /users/{id}` - профиль пользователя
- `PUT /users/{id}` - обновление профиля

### Чаты
- `GET /chats/` - список переписок
- `GET /chats/{id}/messages` - сообщения чата
- `POST /chats/{id}/messages` - отправка сообщения

## Настройки безопасности

### SMS верификация
- Код: 4 цифры
- Время жизни: 5 минут
- Максимум попыток: 3
- Автоматическое удаление старых кодов

### JWT токены
- Алгоритм: HS256
- Время жизни: 30 минут
- Секретный ключ в переменных окружения

### Валидация данных
- Pydantic схемы для всех API
- Валидация паспортных данных
- Проверка формата номера телефона

## Переменные окружения

### База данных
```env
DATABASE_URL=postgresql://postgres:password@localhost/tez_jumush
```

### Безопасность
```env
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### SMS (Twilio)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Файлы (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Требования к системе

### Минимальные требования
- **Backend:** Python 3.8+, PostgreSQL 13+
- **Frontend:** Node.js 18+, Expo CLI
- **Память:** 2GB RAM
- **Диск:** 5GB свободного места

### Рекомендуемые требования
- **Backend:** Python 3.9+, PostgreSQL 14+
- **Frontend:** Node.js 20+, Expo CLI
- **Память:** 4GB RAM
- **Диск:** 10GB свободного места

## Развертывание

### Локальная разработка
1. Клонирование репозитория
2. Установка зависимостей (backend: pip, frontend: npm)
3. Настройка переменных окружения
4. Запуск базы данных (PostgreSQL)
5. Запуск backend сервера
6. Запуск frontend приложения

### Docker развертывание
1. Установка Docker и Docker Compose
2. Настройка переменных окружения
3. Запуск: `docker-compose up -d`
4. Проверка работоспособности

## Мониторинг и логирование

### Логи
- Backend: uvicorn логи
- Frontend: Expo логи
- База данных: PostgreSQL логи

### Мониторинг
- Health check endpoint: `/health`
- API документация: `/docs`
- Статус контейнеров: `docker-compose ps`

## Планы развития

### Краткосрочные (1-3 месяца)
- Улучшение UI/UX
- Добавление push уведомлений
- Оптимизация производительности
- Расширенная система фильтров

### Среднесрочные (3-6 месяцев)
- Система рейтингов и отзывов
- Платежная интеграция
- Многоязычность
- Аналитика и статистика

### Долгосрочные (6+ месяцев)
- Веб-версия приложения
- API для партнеров
- Машинное обучение для рекомендаций
- Расширение на другие страны
