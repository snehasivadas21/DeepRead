from datetime import datetime

from sqlalchemy import DateTime,ForeignKey,String
from sqlalchemy.orm import Mapped,mapped_column

from app.db.base import Base

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"),nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255),unique=True,nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime,nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime,nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime,nullable=False)

     