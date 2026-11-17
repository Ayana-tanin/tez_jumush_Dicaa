# Пример конфигурации - скопируйте в .env файл

# Настройки базы данных
DATABASE_URL=postgresql://postgres:password@localhost/tez_jumush_app?client_encoding=utf8

# Секретный ключ для JWT (в продакшене должен быть сложным)
SECRET_KEY=''

# Настройки Cloudinary (заполните своими данными)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Настройки Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Режим отладки
DEBUG=True
