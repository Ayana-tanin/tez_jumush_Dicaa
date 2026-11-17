# 🚀 Руководство по запуску Backend - Tez Jumush

## 📋 Содержание
1. [Способы запуска](#способы-запуска)
2. [Архитектура Backend](#архитектура-backend)
3. [Архитектура Frontend](#архитектура-frontend)
4. [Хранение данных](#хранение-данных)
5. [API Endpoints](#api-endpoints)

---

## 🚀 Способы запуска

### Вариант 1: Прямой запуск (для разработки)

#### Требования:
- Python 3.8+
- PostgreSQL 13+
- Установленные зависимости

#### Шаги:

1. **Установите зависимости:**
```bash
cd AppTezJumush/backend
pip install -r requirements.txt
```

2. **Настройте переменные окружения:**
Создайте файл `.env` в папке `backend/` на основе `config_example.py`:
```env
DATABASE_URL=postgresql://postgres:password@localhost/tez_jumush_app?client_encoding=utf8
SECRET_KEY=your-secret-key-here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Убедитесь, что PostgreSQL запущен:**
```bash
# Проверьте, что PostgreSQL работает
psql -U postgres -c "SELECT version();"
```

4. **Запустите backend:**
```bash
cd AppTezJumush/backend
python run.py
```

Или напрямую через uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend будет доступен по адресу:** `http://localhost:8000`
**API документация:** `http://localhost:8000/docs`

---

### Вариант 2: Docker Compose (рекомендуется)

#### Требования:
- Docker
- Docker Compose

#### Шаги:

1. **Создайте `.env` файл** (если еще не создан)

2. **Запустите все сервисы:**
```bash
cd AppTezJumush
docker-compose up -d
```

Это запустит:
- PostgreSQL (порт 5432)
- Redis (порт 6379)
- Backend API (порт 8000)
- Frontend (порты 19000-19002)

3. **Проверьте статус:**
```bash
docker-compose ps
```

4. **Просмотр логов:**
```bash
docker-compose logs -f backend
```

5. **Остановка:**
```bash
docker-compose down
```

---

## 🏗️ Архитектура Backend

### Технологический стек:
- **Framework:** FastAPI (Python)
- **База данных:** PostgreSQL
- **ORM:** SQLAlchemy
- **Миграции:** Alembic
- **Аутентификация:** JWT (JSON Web Tokens)
- **SMS/WhatsApp:** Twilio Verify API
- **Email:** FastAPI-Mail
- **OAuth:** Google Auth

### Структура проекта:

```
backend/
├── main.py                 # Точка входа, настройка FastAPI
├── run.py                  # Скрипт запуска с uvicorn
├── database.py            # Настройка подключения к БД
├── config.py              # Конфигурация из переменных окружения
│
├── api/                   # API endpoints (роутеры)
│   ├── auth.py           # Регистрация, вход, JWT
│   ├── google_auth.py    # Google OAuth
│   ├── sms_verification.py  # SMS/WhatsApp верификация
│   ├── tasks.py          # CRUD операции с задачами
│   ├── users.py          # Управление пользователями
│   ├── chats.py          # Система сообщений
│   └── support.py        # Поддержка
│
├── models/                # SQLAlchemy модели (таблицы БД)
│   ├── user.py          # Модель пользователя
│   ├── task.py          # Модель задачи/вакансии
│   ├── message.py       # Модель сообщения
│   └── sms_verification.py  # Модель SMS верификации
│
├── schemas/               # Pydantic схемы (валидация данных)
│   ├── user.py
│   ├── task.py
│   ├── message.py
│   └── sms_verification.py
│
├── core/                  # Бизнес-логика
│   ├── twilio_verify.py  # Интеграция с Twilio
│   ├── email.py          # Отправка email
│   └── sms.py            # Старый SMS сервис (deprecated)
│
└── alembic/              # Миграции базы данных
    └── versions/
```

### Функции Backend:

#### 1. **Аутентификация и авторизация:**
- Регистрация пользователей (телефон + пароль)
- Вход в систему (JWT токены)
- Google OAuth авторизация
- SMS/WhatsApp верификация через Twilio Verify API
- Управление сессиями

#### 2. **Управление задачами (вакансиями):**
- Создание задач (POST /tasks/)
- Получение списка задач (GET /tasks/)
- Поиск задач поблизости (GET /tasks/nearby)
- Получение деталей задачи (GET /tasks/{id})
- Редактирование задач (PUT /tasks/{id})
- Удаление задач (DELETE /tasks/{id})
- Фильтрация по цене, дате, местоположению

#### 3. **Управление пользователями:**
- Профили пользователей
- Обновление профиля
- Загрузка аватаров и документов
- Рейтинговая система
- Верификация пользователей

#### 4. **Система сообщений:**
- Создание чатов
- Отправка сообщений
- История переписок
- Статус прочтения

#### 5. **Поддержка:**
- Отправка обращений в поддержку
- Email уведомления

---

## 🎨 Архитектура Frontend

### Технологический стек:
- **Framework:** React Native с Expo
- **Навигация:** React Navigation
- **State Management:** React Hooks, Context API
- **HTTP Client:** Fetch API с таймаутами
- **Storage:** AsyncStorage

### Структура проекта:

```
frontend/
├── src/
│   ├── screens/          # Экраны приложения
│   │   ├── LoginAndRegistration/
│   │   │   ├── CodeVerificationScreen.js  # Ввод кода подтверждения
│   │   │   ├── RegWorker.js              # Регистрация работника
│   │   │   └── RegestrationEmpl.js       # Регистрация работодателя
│   │   └── ...
│   │
│   ├── utils/            # Утилиты
│   │   ├── api.js        # API сервис
│   │   └── fetchWithTimeout.js  # Безопасные fetch запросы
│   │
│   └── config/           # Конфигурация
│
└── App.js                # Главный компонент
```

### Функции Frontend:

#### 1. **Аутентификация:**
- Формы регистрации (работник/работодатель)
- Ввод и проверка SMS кода
- Вход через Google
- Управление сессиями

#### 2. **Работа с задачами:**
- Просмотр списка задач
- Фильтрация и поиск
- Карта с задачами поблизости
- Создание новых задач
- Детали задачи

#### 3. **Профиль:**
- Просмотр и редактирование профиля
- Загрузка фото
- История выполненных задач

#### 4. **Чаты:**
- Список переписок
- Отправка сообщений
- История сообщений

---

## 💾 Хранение данных

### База данных: PostgreSQL

#### Таблица `users` (Пользователи):
```sql
- id: Integer (PK)
- phone: String (уникальный, может быть null для Google auth)
- email: String (уникальный, для Google auth)
- full_name: String (обязательно)
- google_id: String (уникальный, для Google OAuth)
- profile_picture: String (URL фото профиля)
- passport_series: String
- passport_number: String
- passport_issued_by: String
- passport_date: String
- passport_front: String (URL фото паспорта лицевая)
- passport_back: String (URL фото паспорта обратная)
- avatar: String (URL аватара)
- rating: Float (по умолчанию 5.0)
- is_verified: Boolean (по умолчанию false)
- created_at: DateTime
- updated_at: DateTime
```

#### Таблица `tasks` (Задачи/Вакансии) - **ОСНОВНАЯ ТАБЛИЦА ДЛЯ ВАКАНСИЙ**:
```sql
- id: Integer (PK)
- title: String (название задачи)
- description: Text (описание)
- price: Integer (цена в сомах)
- count_people: Integer (количество людей, по умолчанию 1)
- date: Date (дата выполнения)
- time_from: Time (время начала)
- time_to: Time (время окончания)
- address: String (адрес)
- latitude: Float (широта для геолокации)
- longitude: Float (долгота для геолокации)
- user_id: Integer (FK -> users.id, создатель задачи)
- status: String (active/completed/cancelled, по умолчанию "active")
- created_at: DateTime
- updated_at: DateTime
```

**Все опубликованные вакансии хранятся в таблице `tasks`!**

#### Таблица `messages` (Сообщения):
```sql
- id: Integer (PK)
- content: Text (текст сообщения)
- sender_id: Integer (FK -> users.id)
- receiver_id: Integer (FK -> users.id)
- task_id: Integer (FK -> tasks.id, опционально)
- created_at: DateTime
```

#### Таблица `sms_verifications` (SMS верификация):
```sql
- id: Integer (PK)
- phone: String
- code: String (4 цифры)
- is_verified: Boolean
- attempts: Integer
- expires_at: DateTime
- created_at: DateTime
```

### Где хранятся данные о вакансиях:

**Все вакансии хранятся в PostgreSQL в таблице `tasks`!**

- **Локальная разработка:** База данных PostgreSQL на вашем компьютере
- **Docker:** База данных в контейнере PostgreSQL
- **Production:** Зависит от вашей инфраструктуры (может быть облачная БД)

### Связи между таблицами:

```
users (1) ──< (N) tasks
  │                    │
  │                    │
  └──< (N) messages (N) >──┘
```

- Один пользователь может создать много задач
- Одна задача принадлежит одному пользователю
- Сообщения связывают пользователей и могут быть привязаны к задаче

---

## 🔌 API Endpoints

### Базовый URL:
- **Локально:** `http://localhost:8000`
- **В Docker:** `http://backend:8000`
- **С мобильного устройства:** `http://192.168.79.121:8000` (ваш локальный IP)

### Аутентификация:

```
POST /auth/register          # Регистрация
POST /auth/login             # Вход
GET  /auth/me                # Текущий пользователь
POST /auth/google            # Google OAuth
```

### SMS Верификация:

```
POST /sms/send-code          # Отправка кода (SMS/WhatsApp)
POST /sms/verify-code        # Проверка кода
GET  /sms/status/{phone}     # Статус верификации
```

### Задачи (Вакансии):

```
GET    /tasks/               # Список задач (с фильтрацией)
GET    /tasks/nearby         # Задачи поблизости
GET    /tasks/{id}           # Детали задачи
POST   /tasks/               # Создание задачи (требует авторизации)
PUT    /tasks/{id}           # Редактирование (только создатель)
DELETE /tasks/{id}           # Удаление (только создатель)
```

**Параметры фильтрации для GET /tasks/:**
- `skip` - пропустить N записей
- `limit` - максимум записей (по умолчанию 100)
- `price_min` - минимальная цена
- `price_max` - максимальная цена

### Пользователи:

```
GET /users/phone/{phone}     # Поиск по телефону
GET /users/{id}              # Профиль пользователя
PUT /users/{id}              # Обновление профиля
```

### Чаты:

```
GET  /chats/                 # Список чатов
GET  /chats/{id}/messages    # Сообщения чата
POST /chats/{id}/messages    # Отправка сообщения
```

### Поддержка:

```
POST /support/               # Отправка обращения
```

### Health Check:

```
GET /health                  # Проверка работоспособности
GET /                        # Информация об API
```

---

## 🔧 Полезные команды

### Проверка подключения к БД:
```bash
psql -U postgres -d tez_jumush_app -c "SELECT COUNT(*) FROM tasks;"
```

### Просмотр всех задач:
```bash
psql -U postgres -d tez_jumush_app -c "SELECT id, title, price, status FROM tasks;"
```

### Миграции базы данных:
```bash
cd backend
alembic upgrade head        # Применить миграции
alembic revision --autogenerate -m "описание"  # Создать новую миграцию
```

### Тестирование API:
```bash
# Проверка health
curl http://localhost:8000/health

# Получение списка задач
curl http://localhost:8000/tasks/

# Отправка SMS кода
curl -X POST http://localhost:8000/sms/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+996XXXXXXXXX", "channel": "sms"}'
```

---

## 📝 Важные замечания

1. **IP адрес для мобильных устройств:**
   - В файлах `CodeVerificationScreen.js`, `RegWorker.js`, `RegestrationEmpl.js` и `api.js` указан IP: `192.168.79.121`
   - Замените на ваш локальный IP, если он отличается
   - Узнать IP: `ipconfig` (Windows) или `ifconfig` (Linux/Mac)

2. **Переменные окружения:**
   - Всегда используйте `.env` файл для секретных данных
   - Никогда не коммитьте `.env` в Git

3. **База данных:**
   - При первом запуске таблицы создаются автоматически через `Base.metadata.create_all()`
   - Для продакшена используйте Alembic миграции

4. **CORS:**
   - В `main.py` настроен CORS для всех источников (`allow_origins=["*"]`)
   - В продакшене укажите конкретные домены

---

## 🐛 Troubleshooting

### Backend не запускается:
1. Проверьте, что PostgreSQL запущен
2. Проверьте `DATABASE_URL` в `.env`
3. Проверьте, что порт 8000 свободен
4. Посмотрите логи: `python run.py` или `docker-compose logs backend`

### Ошибка подключения к БД:
1. Убедитесь, что PostgreSQL запущен
2. Проверьте правильность `DATABASE_URL`
3. Проверьте права доступа пользователя БД

### SMS не отправляются:
1. Проверьте `TWILIO_ACCOUNT_SID` и `TWILIO_AUTH_TOKEN` в `.env`
2. Убедитесь, что Service SID правильный
3. Проверьте баланс Twilio аккаунта

---

## 📚 Дополнительная документация

- **API документация:** http://localhost:8000/docs (Swagger UI)
- **ReDoc:** http://localhost:8000/redoc
- **Twilio Setup:** `TWILIO_SETUP.md`
- **Техническая спецификация:** `TECHNICAL_SPECIFICATION.md`

