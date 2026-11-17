from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class TaskApplication(Base):
    __tablename__ = "task_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # работник, который откликнулся
    status = Column(String, default="pending")  # pending, accepted, rejected, cancelled
    message = Column(Text, nullable=True)  # сообщение от работника при отклике
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    task = relationship("Task", back_populates="applications")
    worker = relationship("User", foreign_keys=[worker_id])
    chat = relationship("Chat", back_populates="application", uselist=False)
    
    # Уникальный constraint: один работник может откликнуться на задачу только один раз
    __table_args__ = (
        UniqueConstraint('task_id', 'worker_id', name='uq_task_worker'),
    )

