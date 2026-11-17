from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.message import Message
from models.chat import Chat
from models.user import User
from models.task import Task
from models.task_application import TaskApplication
from schemas.message import MessageCreate, MessageResponse
from schemas.chat import ChatCreate, ChatResponse
from api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создает чат при принятии отклика. Вызывается автоматически при accept application."""
    task = db.query(Task).filter(Task.id == chat_data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Определяем employer и worker
    employer_id = task.user_id
    worker_id = None
    
    if chat_data.application_id:
        application = db.query(TaskApplication).filter(
            TaskApplication.id == chat_data.application_id
        ).first()
        if not application:
            raise HTTPException(status_code=404, detail="Отклик не найден")
        worker_id = application.worker_id
        
        # Проверяем права: только employer может создать чат при принятии отклика
        if current_user.id != employer_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=400, detail="application_id обязателен")
    
    # Проверяем, не существует ли уже чат
    existing_chat = db.query(Chat).filter(
        Chat.task_id == chat_data.task_id,
        Chat.application_id == chat_data.application_id,
        Chat.employer_id == employer_id,
        Chat.worker_id == worker_id
    ).first()
    
    if existing_chat:
        return existing_chat
    
    # Создаем новый чат
    chat = Chat(
        task_id=chat_data.task_id,
        application_id=chat_data.application_id,
        employer_id=employer_id,
        worker_id=worker_id
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.get("/by-task-application", response_model=ChatResponse)
async def get_chat_by_task_application(
    task_id: int = Query(...),
    application_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить чат по task_id и application_id (для фронтенда с chatId = task_{taskId}_app_{applicationId})"""
    chat = db.query(Chat).filter(
        Chat.task_id == task_id,
        Chat.application_id == application_id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    
    # Проверяем, что пользователь является участником чата
    if current_user.id not in [chat.employer_id, chat.worker_id]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    return chat

@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    
    # Проверяем, что пользователь является участником чата
    if current_user.id not in [chat.employer_id, chat.worker_id]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.created_at).all()
    return messages

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def create_message(
    chat_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"[CHAT DEBUG] ========== СОЗДАНИЕ СООБЩЕНИЯ ==========")
    print(f"[CHAT DEBUG] Chat ID: {chat_id}")
    print(f"[CHAT DEBUG] Current User ID: {current_user.id}")
    print(f"[CHAT DEBUG] Message text: {message.text}")
    
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        print(f"[CHAT ERROR] Чат {chat_id} не найден")
        raise HTTPException(status_code=404, detail="Чат не найден")
    
    print(f"[CHAT DEBUG] Чат найден: employer_id={chat.employer_id}, worker_id={chat.worker_id}")
    
    # Проверяем, что пользователь является участником чата
    if current_user.id not in [chat.employer_id, chat.worker_id]:
        print(f"[CHAT ERROR] Пользователь {current_user.id} не имеет доступа к чату {chat_id}")
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    db_message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        text=message.text,
        is_read=False
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    print(f"[CHAT SUCCESS] Сообщение создано: ID={db_message.id}")
    return db_message
