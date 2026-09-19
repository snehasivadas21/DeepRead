from datetime import datetime

from pydantic import BaseModel


class ConversationCreate(BaseModel):
    workspace_id: int
    title: str = "New conversation"


class ConversationResponse(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    citations: list[dict] | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse
    citations: list[dict]