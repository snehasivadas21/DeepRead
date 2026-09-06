from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"),unique=True,nullable=False,index=True)
    name: Mapped[str] = mapped_column(String(150),nullable=False)
    profile_image: Mapped[str | None] = mapped_column(String(500),nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime,nullable=False,default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime,nullable=False,default=datetime.utcnow,onupdate=datetime.utcnow)