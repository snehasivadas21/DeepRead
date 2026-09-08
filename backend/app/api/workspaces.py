from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.workspaces import Workspace
from app.models.users import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate
from app.core.security import get_current_user


router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("/", response_model=WorkspaceResponse, status_code=201)
def create_workspace(
    data: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = Workspace(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
    )

    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    return workspace

@router.get("/", response_model=list[WorkspaceResponse])
def get_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspaces = (
        db.query(Workspace)
        .filter(Workspace.user_id == current_user.id)
        .order_by(Workspace.updated_at.desc())
        .all()
    )

    return workspaces

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    return workspace

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: int,
    data: WorkspaceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    workspace.name = data.name
    workspace.description = data.description

    db.commit()
    db.refresh(workspace)

    return workspace

@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    db.delete(workspace)
    db.commit()

    return {"message": "Workspace deleted successfully"}
