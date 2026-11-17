from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Создание движка базы данных с настройками кодировки
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Установите True для отладки SQL запросов
    pool_pre_ping=True,  # Проверка соединения перед использованием
    connect_args={
        "client_encoding": "utf8",
        "options": "-c timezone=UTC"
    }
)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Функция для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
