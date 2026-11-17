from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskApplicationBase(BaseModel):
    task_id: int
    message: Optional[str] = None

class TaskApplicationCreate(TaskApplicationBase):
    pass

class TaskApplicationUpdate(BaseModel):
    status: Optional[str] = None  # pending, accepted, rejected, cancelled

class TaskApplicationResponse(TaskApplicationBase):
    id: int
    worker_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

