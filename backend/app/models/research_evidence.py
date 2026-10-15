from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResearchEvidence(Base):
    __tablename__ = "research_evidence"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    research_task_id: Mapped[int] = mapped_column(
        ForeignKey("research_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    step_id: Mapped[int] = mapped_column(
        ForeignKey("research_steps.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    source_id: Mapped[int] = mapped_column(
        ForeignKey("sources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    chunk_id: Mapped[int] = mapped_column(
        ForeignKey("document_chunks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    relevance_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    research_task: Mapped["ResearchTask"] = relationship(
        "ResearchTask",
    )

    step: Mapped["ResearchStep"] = relationship(
        "ResearchStep",
    )

    source: Mapped["Source"] = relationship(
        "Source",
    )

    chunk: Mapped["DocumentChunk"] = relationship(
        "DocumentChunk",
    )