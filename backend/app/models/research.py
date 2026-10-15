from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class ResearchTask(Base):
    __tablename__ = "research_tasks"

    id : Mapped[int] = mapped_column(Integer,primary_key=True,index=True)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id"),nullable=False,index=True)
    workspace_id : Mapped[int] = mapped_column(ForeignKey("workspaces.id",ondelete="CASCADE"))
    query : Mapped[str] = mapped_column(Text,nullable=False)
    status : Mapped[str] = mapped_column(String(50),default="pending",nullable=False,index=True)
    current_step : Mapped[int] = mapped_column(Integer,default=0,nullable=False)
    progress : Mapped[int] = mapped_column(Integer,default=0,nullable=False)
    report: Mapped[str | None] = mapped_column(Text,nullable=True,)
    created_at : Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,nullable=False)
    updated_at : Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow,nullable=True)
    completed_at : Mapped[datetime | None] = mapped_column(DateTime,nullable=True)

    user : Mapped["User"] = relationship("User")
    workspace : Mapped["Workspace"] = relationship("Workspace")
    steps: Mapped[list["ResearchStep"]] = relationship("ResearchStep",back_populates="research_task",cascade="all, delete-orphan",)