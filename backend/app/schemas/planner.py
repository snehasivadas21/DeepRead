from pydantic import BaseModel


class PlannerStep(BaseModel):
    step_number: int
    question: str


class PlannerOutput(BaseModel):
    steps: list[PlannerStep]