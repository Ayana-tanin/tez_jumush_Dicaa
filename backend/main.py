from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, tasks, users, chats, support, sms_verification, google_auth, applications
from database import engine, Base
from models import User, Task, Message, SMSVerification, TaskApplication, Chat  # Импорт моделей для создания таблиц

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tez Jumush API",
    description="API для мобильного приложения быстрых задач",
    version="1.0.0"
)

# Настройка CORS для работы с мобильным приложением
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(google_auth.router, prefix="/auth", tags=["google-auth"])
app.include_router(sms_verification.router, prefix="/sms", tags=["sms"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(applications.router, prefix="/applications", tags=["applications"])
app.include_router(support.router, prefix="/support", tags=["support"])

@app.get("/")
async def root():
    return {"message": "Tez Jumush API работает!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
