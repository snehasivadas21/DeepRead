from pydantic import BaseModel


class RetrievalResult(BaseModel):
    chunk_id: int
    source_id: int
    page_number: int | None
    content: str
    rerank_score: float


class RetrievalOutput(BaseModel):
    results: list[RetrievalResult]