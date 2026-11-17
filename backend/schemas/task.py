from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: int
    count_people: int = 1
    date: date
    time_from: time
    time_to: time
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    count_people: Optional[int] = None
    date: Optional[date] = None
    time_from: Optional[time] = None
    time_to: Optional[time] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
