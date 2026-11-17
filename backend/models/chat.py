from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("task_applications.id"), nullable=True)  # для чата по отклику
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # создатель задачи
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # работник
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    task = relationship("Task", back_populates="chats")
    application = relationship("TaskApplication", back_populates="chat")
    employer = relationship("User", foreign_keys=[employer_id])
    worker = relationship("User", foreign_keys=[worker_id])
    messages = relationship("Message", back_populates="chat")
    
    # Уникальный constraint: один чат на одну пару employer-worker-task-application
    __table_args__ = (
        UniqueConstraint('task_id', 'application_id', 'employer_id', 'worker_id', name='uq_chat_task_app_users'),
    )

