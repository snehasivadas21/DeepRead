from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class ResearchStep(Base):
    __tablename__ = "research_steps"

    id : Mapped[int] = mapped_column(Integer,primary_key=True,index=True)
    research_task_id : Mapped[int] = mapped_column(ForeignKey("research_tasks.id"),nullable=False,index=True)
    step_number : Mapped[int] = mapped_column(Integer,default=0,nullable=False)
    question : Mapped[str] = mapped_column(Text,nullable=False) 
    status : Mapped[str] = mapped_column(String(50),default="pending",nullable=False,index=True)
    result : Mapped[str | None] = mapped_column(Text,nullable=True)
    analysis: Mapped[str | None] = mapped_column(Text,nullable=True)
    created_at :  Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,nullable=False)    
    updated_at : Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow,nullable=True)

    research_task : Mapped["ResearchTask"] = relationship("ResearchTask",back_populates="steps")