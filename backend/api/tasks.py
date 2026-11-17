from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.task import Task
from models.user import User
from models.task_application import TaskApplication
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from schemas.task_application import TaskApplicationCreate, TaskApplicationResponse
from api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    price_min: Optional[int] = Query(None),
    price_max: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.status == "active")
    
    if price_min is not None:
        query = query.filter(Task.price >= price_min)
    if price_max is not None:
        query = query.filter(Task.price <= price_max)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/nearby", response_model=List[TaskResponse])
async def get_tasks_nearby(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: float = Query(5.0),  # радиус в километрах
    db: Session = Depends(get_db)
):
    # Простой поиск по прямоугольнику (для демонстрации)
    # В реальном проекте лучше использовать PostGIS
    lat_delta = radius / 111.0  # приблизительно 1 градус = 111 км
    lon_delta = radius / (111.0 * abs(lat))
    
    tasks = db.query(Task).filter(
        Task.status == "active",
        Task.latitude.between(lat - lat_delta, lat + lat_delta),
        Task.longitude.between(lon - lon_delta, lon + lon_delta)
    ).all()
    
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task

@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_task = Task(**task.dict(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для редактирования")
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для удаления")
    
    db.delete(task)
    db.commit()
    return {"message": "Задача удалена"}

@router.post("/{task_id}/apply", response_model=TaskApplicationResponse)
async def apply_to_task(
    task_id: int,
    application: TaskApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Откликнуться на задачу"""
    # Проверяем существование задачи
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Проверяем, что task_id в теле запроса совпадает с параметром
    if application.task_id != task_id:
        raise HTTPException(status_code=400, detail="task_id в теле запроса не совпадает с параметром")
    
    # Проверяем, не откликнулся ли уже пользователь
    existing = db.query(TaskApplication).filter(
        TaskApplication.task_id == task_id,
        TaskApplication.worker_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже откликнулись на эту задачу")
    
    # Создаем отклик
    db_application = TaskApplication(
        task_id=task_id,
        worker_id=current_user.id,
        message=application.message,
        status="pending"
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.get("/{task_id}/applications", response_model=List[TaskApplicationResponse])
async def get_task_applications(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить отклики на задачу"""
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
