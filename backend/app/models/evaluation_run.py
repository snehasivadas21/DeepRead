
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Text,
    JSON,
    Float,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    dataset_id: Mapped[int] = mapped_column(
        ForeignKey("evaluation_datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    case_id: Mapped[int] = mapped_column(
        ForeignKey("evaluation_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question: Mapped[str] = mapped_column(
        String, nullable=False
    )

    top_k: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    precision_at_k: Mapped[float] = mapped_column(
        Float, nullable=False
    )

    recall_at_k: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    f1_at_k: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    retrieved_chunk_ids: Mapped[list[int]] = mapped_column(
        JSON, nullable=False
    )

    relevant_chunk_ids: Mapped[list[int]] = mapped_column(
        JSON, nullable=False
    )

    
    answer: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    answer_relevance: Mapped[float] = mapped_column(
        Float, nullable=False
    )

    faithfulness: Mapped[float] = mapped_column(
        Float, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
