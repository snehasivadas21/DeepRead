from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EvaluationRunResponse(BaseModel):
    id: int
    dataset_id: int
    case_id: int
    user_id: int
    question: str
    top_k: int
    precision_at_k: float
    recall_at_k: float | None
    f1_at_k: float | None
    retrieved_chunk_ids: list[int]
    relevant_chunk_ids: list[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvaluationResultResponse(BaseModel):
    run_id: int
    case_id: int
    dataset_id: int
    workspace_id: int
    question: str
    top_k: int
    retrieved_chunk_ids: list[int]
    relevant_chunk_ids: list[int]
    relevant_found: int
    precision_at_k: float
    recall_at_k: float | None
    f1_at_k: float | None
    answer: str
    answer_relevance: float
    faithfulness: float
