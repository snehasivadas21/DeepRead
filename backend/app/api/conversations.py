from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user

from app.db.dependencies import get_db

from app.models.conversations import Conversation
from app.models.workspaces import Workspace
from app.models.messages import Message
from app.models.users import User

from app.schemas.conversation import (ConversationCreate,ConversationResponse,MessageCreate)

from fastapi.responses import StreamingResponse

from app.services.rag import stream_question

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "/",
    response_model=ConversationResponse,
)
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == data.workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    conversation = Conversation(
        workspace_id=data.workspace_id,
        user_id=current_user.id,
        title=data.title,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


@router.get(
    "/",
    response_model=list[ConversationResponse],
)
def list_conversations(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversations = (
        db.query(Conversation)
        .filter(
            Conversation.workspace_id == workspace_id,
            Conversation.user_id == current_user.id,
        )
        .order_by(Conversation.created_at.desc())
        .all()
    )

    return conversations


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return conversation

@router.post("/{conversation_id}/messages/stream")
def stream_message(
    conversation_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=data.content,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    answer_stream, citations = stream_question(
        db=db,
        query=data.content,
        workspace_id=conversation.workspace_id,
        top_k=5,
        source_id=data.source_id,
        page_number=data.page_number,
    )

    def generate():
        full_answer = ""

        for token in answer_stream:
            full_answer += token
            yield token

        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=full_answer,
            citations=citations,
        )

        db.add(assistant_message)
        db.commit()

    return StreamingResponse(
        generate(),
        media_type="text/plain",
    )