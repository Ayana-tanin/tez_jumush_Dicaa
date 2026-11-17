from sqlalchemy import Column, Integer, String, Text, Float, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Integer, nullable=False)  # Цена в сомах
    count_people = Column(Integer, default=1)
    date = Column(Date, nullable=False)
    time_from = Column(Time, nullable=False, server_default='08:00:00')
    time_to = Column(Time, nullable=False, server_default='17:00:00')
    address = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="active")  # active, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    user = relationship("User", back_populates="tasks")
    applications = relationship("TaskApplication", back_populates="task")
    chats = relationship("Chat", back_populates="task")
