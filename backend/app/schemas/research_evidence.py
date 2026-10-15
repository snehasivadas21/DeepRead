from pydantic import BaseModel


class ResearchEvidenceCreate(BaseModel):
    research_task_id: int
    step_id: int
    source_id: int
    chunk_id: int
    content: str
    page_number: int | None = None
    relevance_score: float


class ResearchEvidenceResponse(BaseModel):
    id: int
    research_task_id: int
    step_id: int
    source_id: int
    chunk_id: int
    content: str
    page_number: int | None
    relevance_score: float

    model_config = {
        "from_attributes": True
    }