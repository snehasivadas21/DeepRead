from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user

from app.db.dependencies import get_db

from app.models.workspaces import Workspace

from app.schemas.search import SearchRequest

from app.services.rag import answer_question


router = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)


@router.post("/ask")
def ask_question(
    workspace_id: int,
    data: SearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return answer_question(
        db=db,
        query=data.query,
        workspace_id=workspace_id,
        top_k=data.top_k,
    )