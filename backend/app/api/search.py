from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.models.workspaces import Workspace

from app.schemas.search import SearchRequest

from app.services.vector_search import search_similar_chunks

from app.core.security import get_current_user


router = APIRouter(prefix="/search",tags=["Search"],)

@router.post("/")
def semantic_search(workspace_id: int,data: SearchRequest,db: Session = Depends(get_db),current_user=Depends(get_current_user),):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404,detail="Workspace not found",)

    results = search_similar_chunks(
        db=db,
        query=data.query,
        workspace_id=workspace_id,
        top_k=data.top_k,
    )

    return {
        "query": data.query,
        "workspace_id": workspace_id,
        "results": [
            {
                "chunk_id": item["chunk"].id,
                "similarity": item["similarity"],
                "text": item["chunk"].text,
                "page_number": item["chunk"].page.page_number,
                "source_id": item["chunk"].source_id,
            }
            for item in results
        ],
    }