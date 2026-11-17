from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatBase(BaseModel):
    task_id: int
    application_id: Optional[int] = None
    employer_id: int
    worker_id: int

class ChatCreate(BaseModel):
    task_id: int
    application_id: Optional[int] = None

class ChatResponse(ChatBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

