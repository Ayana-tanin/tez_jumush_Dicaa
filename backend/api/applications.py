from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.task_application import TaskApplication
from models.task import Task
from models.user import User
from models.chat import Chat
from schemas.task_application import TaskApplicationCreate, TaskApplicationUpdate, TaskApplicationResponse
from api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=TaskApplicationResponse)
async def create_application(
    application: TaskApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверяем существование задачи
    task = db.query(Task).filter(Task.id == application.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Проверяем, не откликнулся ли уже пользователь
    existing = db.query(TaskApplication).filter(
        TaskApplication.task_id == application.task_id,
        TaskApplication.worker_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже откликнулись на эту задачу")
    
    # Создаем отклик
    db_application = TaskApplication(
        task_id=application.task_id,
        worker_id=current_user.id,
        message=application.message,
        status="pending"
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.get("/task/{task_id}", response_model=List[TaskApplicationResponse])
async def get_task_applications(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Только создатель задачи может видеть отклики
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    applications = db.query(TaskApplication).filter(
        TaskApplication.task_id == task_id
    ).all()
    return applications

@router.put("/{application_id}/accept", response_model=TaskApplicationResponse)
async def accept_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(TaskApplication).filter(TaskApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Отклик не найден")
    
    task = db.query(Task).filter(Task.id == application.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Только создатель задачи может принять отклик
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    if application.status != "pending":
        raise HTTPException(status_code=400, detail="Отклик уже обработан")
    
    # Обновляем статус отклика
    application.status = "accepted"
    db.commit()
    db.refresh(application)
    
    # Создаем чат при принятии отклика
    existing_chat = db.query(Chat).filter(
        Chat.task_id == task.id,
        Chat.application_id == application_id,
        Chat.employer_id == task.user_id,
        Chat.worker_id == application.worker_id
    ).first()
    
    if not existing_chat:
        chat = Chat(
            task_id=task.id,
            application_id=application_id,
            employer_id=task.user_id,
            worker_id=application.worker_id
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
    
    return application

@router.put("/{application_id}/reject", response_model=TaskApplicationResponse)
async def reject_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(TaskApplication).filter(TaskApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Отклик не найден")
    
    task = db.query(Task).filter(Task.id == application.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    if application.status != "pending":
        raise HTTPException(status_code=400, detail="Отклик уже обработан")
    
    application.status = "rejected"
    db.commit()
    db.refresh(application)
    return application

@router.get("/my", response_model=List[TaskApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    applications = db.query(TaskApplication).filter(
        TaskApplication.worker_id == current_user.id
    ).all()
    return applications

@router.patch("/{application_id}", response_model=TaskApplicationResponse)
async def update_application(
    application_id: int,
    application_update: TaskApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить статус отклика"""
    application = db.query(TaskApplication).filter(TaskApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Отклик не найден")
    
    task = db.query(Task).filter(Task.id == application.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Проверяем права: только создатель задачи может менять статус отклика
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Обновляем статус
    if application_update.status:
        if application_update.status not in ["pending", "accepted", "rejected", "cancelled"]:
            raise HTTPException(status_code=400, detail="Недопустимый статус")
        application.status = application_update.status
        
        # Если отклик принят, создаем чат
        if application_update.status == "accepted":
            from models.chat import Chat
            existing_chat = db.query(Chat).filter(
                Chat.task_id == task.id,
                Chat.application_id == application_id,
                Chat.employer_id == task.user_id,
                Chat.worker_id == application.worker_id
            ).first()
            
            if not existing_chat:
                chat = Chat(
                    task_id=task.id,
                    application_id=application_id,
                    employer_id=task.user_id,
                    worker_id=application.worker_id
                )
                db.add(chat)
    
    db.commit()
    db.refresh(application)
    return application

