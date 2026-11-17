# 🛠 Руководство по настройке Tez Jumush

## 📋 Требования

### Системные требования
- **Python 3.8+** (рекомендуется 3.11+)
- **Node.js 18+**
- **PostgreSQL 13+**
- **Git**

### Инструменты разработки
- **Expo CLI**: `npm install -g @expo/cli`
- **VS Code** (рекомендуется) с расширениями:
  - Python
  - React Native Tools
  - REST Client

## 🚀 Быстрый старт

### 1. Клонирование проекта
```bash
git clone <repository-url>
cd tez_jumush_2
```

### 2. Настройка Backend

#### Установка зависимостей
```bash
cd backend
py -m venv venv
venv\Scripts\activate  # Windows
# или
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

#### Настройка базы данных
1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE tez_jumush;
CREATE USER tez_user WITH PASSWORD 'tez_password';
GRANT ALL PRIVILEGES ON DATABASE tez_jumush TO tez_user;
```

3. Создайте файл `.env` в папке `backend/`:
```env
DATABASE_URL=postgresql://tez_user:tez_password@localhost/tez_jumush
SECRET_KEY=your-super-secret-key-here
DEBUG=True
```

#### Запуск сервера
```bash
python run.py
```

Сервер будет доступен по адресу: http://localhost:8000

### 3. Настройка Frontend

#### Установка зависимостей
```bash
cd frontend
npm install
```

#### Запуск приложения
```bash
npx expo start
```

## 📱 Тестирование API

### Swagger UI
После запуска сервера откройте: http://localhost:8000/docs

### Основные эндпоинты
- `POST /auth/register` - регистрация
- `POST /auth/login` - вход
- `GET /auth/me` - профиль пользователя
- `GET /tasks/` - список задач
- `POST /tasks/` - создание задачи

## 🗄 Структура базы данных

### Таблица users
- `id` - уникальный идентификатор
- `phone` - номер телефона (уникальный)
- `full_name` - полное имя
- `password_hash` - хеш пароля
- `passport_front` - URL фото паспорта (лицевая)
- `passport_back` - URL фото паспорта (обратная)
- `avatar` - URL аватара
- `rating` - рейтинг пользователя
- `is_verified` - статус верификации
- `created_at` - дата создания
- `updated_at` - дата обновления

### Таблица tasks
- `id` - уникальный идентификатор
- `title` - название задачи
- `description` - описание
- `price` - цена в сомах
- `count_people` - количество людей
- `date` - дата выполнения
- `time` - время выполнения
- `address` - адрес
- `latitude` - широта
- `longitude` - долгота
- `user_id` - ID создателя задачи
- `status` - статус (active/completed/cancelled)
- `created_at` - дата создания
- `updated_at` - дата обновления

### Таблица messages
- `id` - уникальный идентификатор
- `sender_id` - ID отправителя
- `receiver_id` - ID получателя
- `task_id` - ID задачи
- `text` - текст сообщения
- `timestamp` - время отправки
- `is_read` - прочитано ли сообщение

## 🔧 Настройка Cloudinary (опционально)

1. Зарегистрируйтесь на [Cloudinary](https://cloudinary.com)
2. Получите API ключи
3. Добавьте в `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🐛 Решение проблем

### Ошибка подключения к базе данных
- Проверьте, что PostgreSQL запущен
- Убедитесь в правильности DATABASE_URL
- Проверьте права пользователя базы данных

### Ошибки Python
- Убедитесь, что виртуальное окружение активировано
- Проверьте версию Python: `py --version`
- Переустановите зависимости: `pip install -r requirements.txt`

### Ошибки React Native
- Очистите кэш: `npx expo start --clear`
- Переустановите зависимости: `npm install`
- Проверьте версию Node.js: `node --version`

## 📚 Полезные команды

### Backend
```bash
# Активация виртуального окружения
venv\Scripts\activate

# Запуск сервера
python run.py

# Создание миграций (если используется Alembic)
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head
```

### Frontend
```bash
# Запуск в режиме разработки
npx expo start

# Запуск на Android
npx expo start --android

# Запуск на iOS
npx expo start --ios

# Сборка для продакшена
npx expo build:android
npx expo build:ios
```

## 🎯 Следующие шаги

1. Настройте базу данных PostgreSQL
2. Создайте файл `.env` с правильными настройками
3. Запустите backend сервер
4. Запустите frontend приложение
5. Протестируйте API через Swagger UI
6. Начните разработку согласно плану в `development-plan.md`
