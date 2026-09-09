from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SourceResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    source_type: str
    file_url: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)