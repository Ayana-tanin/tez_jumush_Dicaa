# 📊 Анализ базы данных бэкенда

## ✅ Существующие таблицы (модели)

### 1. **users** (пользователи)
```python
- id: Integer (PK)
- phone: String (unique, nullable)
- email: String (unique, nullable)
- full_name: String
- google_id: String (unique, nullable)
- profile_picture: String (nullable)
- passport_series: String (nullable)
- passport_number: String (nullable)
- passport_issued_by: String (nullable)
- passport_date: String (nullable)
- passport_front: String (nullable)
- passport_back: String (nullable)
- avatar: String (nullable)
- rating: Float (default=5.0)
- is_verified: Boolean (default=False)
- created_at: DateTime
- updated_at: DateTime
```

### 2. **tasks** (задачи)
```python
- id: Integer (PK)
- title: String
- description: Text (nullable)
- price: Integer
- count_people: Integer (default=1)
- date: Date
- time_from: Time
- time_to: Time
- address: String
- latitude: Float (nullable)
- longitude: Float (nullable)
- user_id: Integer (FK -> users.id)
- status: String (default="active") # active, completed, cancelled
- created_at: DateTime
- updated_at: DateTime
```

### 3. **messages** (сообщения в чатах)
```python
- id: Integer (PK)
- sender_id: Integer (FK -> users.id)
- receiver_id: Integer (FK -> users.id)
- task_id: Integer (FK -> tasks.id, nullable)
- text: Text (⚠️ В миграции поле называется "content", а в модели "text" - несоответствие!)
- timestamp: DateTime (в модели) / created_at: DateTime (в миграции - несоответствие!)
- is_read: Boolean (default=False) (⚠️ В миграции нет этого поля!)
```

**⚠️ ПРОБЛЕМА:** Есть несоответствие между моделью и миграцией:
- В модели: поле `text`, в миграции: поле `content`
- В модели: поле `timestamp`, в миграции: поле `created_at`
- В модели: поле `is_read`, в миграции: этого поля нет

### 4. **sms_verifications** (SMS верификация)
```python
- id: Integer (PK)
- phone: String
- code: String
- is_verified: Boolean
- attempts: Integer
- created_at: DateTime
- expires_at: DateTime
```

---

## ❌ ОТСУТСТВУЕТ: Таблица для откликов (TaskApplication)

**Проблема:** В БД нет таблицы для хранения откликов работников на задачи. Сейчас на фронтенде используется локальное хранилище (`TasksContext`), но данные не сохраняются на сервере.

### Что нужно добавить:

#### Модель **task_applications** (отклики/заявки)
```python
- id: Integer (PK)
- task_id: Integer (FK -> tasks.id)
- worker_id: Integer (FK -> users.id) # работник, который откликнулся
- status: String (default="pending") # pending, accepted, rejected, cancelled
- message: Text (nullable) # сообщение от работника при отклике
- created_at: DateTime
- updated_at: DateTime
```

**Связи:**
- Одна задача может иметь много откликов
- Один работник может откликнуться на много задач
- Один работник может откликнуться на одну задачу только один раз

---

## 💬 Работает ли чат?

### ✅ Что работает:
1. **Модель Message** существует в БД
2. **API для чатов** (`/chats/`) реализован:
   - `GET /chats/` - получить сообщения по task_id
   - `POST /chats/` - создать сообщение
3. **На фронтенде** чат работает через AsyncStorage (локально)

### ⚠️ Проблемы:
1. **Чат работает только локально** - сообщения сохраняются в AsyncStorage, но не синхронизируются с сервером
2. **Нет WebSocket** - нет real-time обновлений сообщений
3. **Нет группировки по chatId** - API чата работает только по task_id, но на фронтенде используется chatId вида `task_{id}_app_{applicationId}`
4. **Нет связи с applicationId** - сообщения не связаны с откликом (applicationId), только с задачей

---

## 🔧 Что нужно сделать для полноценной работы:

### 1. Создать модель TaskApplication
- Миграция для таблицы `task_applications`
- Модель в `models/task_application.py`
- Схемы в `schemas/task_application.py`

### 2. Обновить API для чатов
- Добавить поддержку `application_id` в сообщениях (или сделать отдельную таблицу чатов)
- Или создать таблицу `chats` для группировки сообщений

### 3. Подключить фронтенд к бэкенду
- Заменить AsyncStorage на API вызовы
- Синхронизировать сообщения с сервером
- (Опционально) Добавить WebSocket для real-time обновлений

---

## 📝 Рекомендации:

### Вариант 1: Простой (текущая структура)
- Использовать существующую таблицу `messages` с `task_id`
- Для чата по отклику использовать `task_id` + фильтрацию по sender_id/receiver_id

### Вариант 2: Расширенный (рекомендуемый)
- Создать таблицу `task_applications` для откликов
- Добавить поле `application_id` в таблицу `messages` (nullable)
- Или создать отдельную таблицу `chats` для группировки:
  ```python
  - id: Integer (PK)
  - task_id: Integer (FK -> tasks.id)
  - application_id: Integer (FK -> task_applications.id, nullable)
  - employer_id: Integer (FK -> users.id)
  - worker_id: Integer (FK -> users.id)
  - created_at: DateTime
  ```
- И связать `messages.chat_id` -> `chats.id`

---

## 🎯 Текущее состояние:

- ✅ База данных: 4 таблицы (users, tasks, messages, sms_verifications)
- ❌ Отклики: Нет таблицы, хранятся только локально на фронтенде
- ⚠️ Чат: API есть, но фронтенд не использует его (работает через AsyncStorage)
- ✅ Задачи: Полностью реализованы в БД
- ✅ Пользователи: Полностью реализованы в БД

