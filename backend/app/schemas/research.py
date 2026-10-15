from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResearchCreate(BaseModel):
    workspace_id: int
    query: str


class ResearchResponse(BaseModel):
    id: int
    workspace_id: int
    query: str
    status: str
    current_step: int
    progress: int
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

class ResearchEvidenceDetail(BaseModel):
    id: int
    source_id: int
    chunk_id: int
    page_number: int | None
    content: str
    relevance_score: float

    model_config = ConfigDict(from_attributes=True)


class ResearchStepDetail(BaseModel):
    id: int
    step_number: int
    question: str
    status: str
    result: str | None
    analysis: str | None
    evidence: list[ResearchEvidenceDetail] = Field(
        default_factory=list
    )


class ResearchDetailsResponse(BaseModel):
    id: int
    workspace_id: int
    query: str
    status: str
    current_step: int
    progress: int
    report: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    steps: list[ResearchStepDetail] = Field(
        default_factory=list
    )