from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
import config

# Конфигурация для отправки email
conf = ConnectionConfig(
    MAIL_USERNAME=config.MAIL_USERNAME,
    MAIL_PASSWORD=config.MAIL_PASSWORD,
    MAIL_FROM=config.MAIL_FROM,
    MAIL_PORT=config.MAIL_PORT,
    MAIL_SERVER=config.MAIL_SERVER,
    MAIL_FROM_NAME=config.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_support_email(
    subject: str,
    message: str,
    user_email: str = None,
    user_name: str = None
):
    """
    Отправляет email уведомление в службу поддержки
    """
    try:
        # Формируем содержимое письма
        html_content = f"""
        <html>
        <body>
            <h2>Новое обращение в службу поддержки</h2>
            <p><strong>Тема:</strong> {subject}</p>
            <p><strong>Сообщение:</strong></p>
            <p>{message}</p>
            
            <hr>
            <p><strong>Информация о пользователе:</strong></p>
            <p>Email: {user_email or 'Не указан'}</p>
            <p>Имя: {user_name or 'Не указано'}</p>
            
            <p><em>Это сообщение отправлено автоматически из приложения Tez Jumush</em></p>
        </body>
        </html>
        """
        
        # Создаем сообщение
        message_schema = MessageSchema(
            subject=f"[Tez Jumush Support] {subject}",
            recipients=config.SUPPORT_EMAILS,
            body=html_content,
            subtype="html"
        )
        
        # Отправляем email
        fm = FastMail(conf)
        await fm.send_message(message_schema)
        
        return True
        
    except Exception as e:
        print(f"Ошибка отправки email: {e}")
        return False

async def send_notification_email(
    to_email: str,
    subject: str,
    message: str
):
    """
    Отправляет уведомление пользователю
    """
    try:
        html_content = f"""
        <html>
        <body>
            <h2>{subject}</h2>
            <p>{message}</p>
            <p><em>С уважением, команда Tez Jumush</em></p>
        </body>
        </html>
        """
        
        message_schema = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=html_content,
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message_schema)
        
        return True
        
    except Exception as e:
        print(f"Ошибка отправки уведомления: {e}")
        return False
