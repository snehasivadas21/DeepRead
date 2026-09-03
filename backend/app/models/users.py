from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class User(Base):
    __tablename__="users"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    email: Mapped[str] = mapped_column(String(255),unique=True,nullable=False,index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    user_name: Mapped[str | None] = mapped_column(String(150))
    is_active: Mapped[bool] = mapped_column(Boolean,default=True,nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean,default=False,nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow,nullable=False)
    