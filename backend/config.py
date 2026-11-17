import os
from dotenv import load_dotenv

load_dotenv()

# Настройки базы данных
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/tez_jumush_app?client_encoding=utf8")

# Настройки JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Настройки Cloudinary (для загрузки фото)
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Настройки Email
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-app-password")
MAIL_FROM = os.getenv("MAIL_FROM", "your-email@gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Tez Jumush Support")

# Email адреса поддержки
SUPPORT_EMAILS = [
    "support@example.com",
    "support2@example.com"
]

# Настройки SMS (Twilio)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Настройки WhatsApp (Twilio WhatsApp Sender)
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")  # формат: whatsapp:+14155238886

# Настройки Twilio Verify API
TWILIO_VERIFY_SERVICE_SID = os.getenv("TWILIO_VERIFY_SERVICE_SID", "VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

# Настройки SMS верификации
SMS_CODE_LENGTH = 4
SMS_CODE_EXPIRE_MINUTES = 5
SMS_MAX_ATTEMPTS = 3

# Настройки Google OAuth
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "1082726228928-jpcqcu5t3j87kf0qvlo4og6gotrje6q0.apps.googleusercontent.com",
)
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# Callback для PWA/web
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "https://backendapptj-production.up.railway.app/auth/google/callback",
)
 
# Настройки приложения
APP_NAME = "Tez Jumush"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
