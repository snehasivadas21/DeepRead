from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user

from app.db.dependencies import get_db

from app.models.conversations import Conversation
from app.models.messages import Message

from app.schemas.conversation import MessageCreate, MessageResponse, ChatResponse

from app.services.rag import answer_question

router = APIRouter(
    prefix="/conversations",
    tags=["Messages"],
)


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def list_messages(
    conversation_id: int,
    limit: int =20,
    offset: int =0,
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

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.post(
    "/{conversation_id}/messages",
    response_model=ChatResponse,
)
def send_message(
    conversation_id: int,
    data: MessageCreate,
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

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=data.content,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    result = answer_question(
        db=db,
        query=data.content,
        workspace_id=conversation.workspace_id,
        top_k=5,
        source_id=data.source_id,
        page_number=data.page_number,
    )

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=result["answer"],
        citations=result["citations"],
    )

    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return {
        "user_message": user_message,
        "assistant_message": assistant_message,
        "citations": result["citations"],
    }