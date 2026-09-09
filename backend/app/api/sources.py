# from fastapi import APIRouter, Depends, HTTPException, File
# from sqlalchemy.orm import Session

# from app.core.security import get_current_user
# from app.db.dependencies import get_db
# from app.models.sources import Source
# from app.models.users import User
# from app.models.workspaces import Workspace
# from app.schemas.source import SourceResponse

# from pathlib import Path
# from uuid import uuid4


# router = APIRouter(
#     prefix="/workspaces/{workspace_id}/sources",
#     tags=["Sources"],
# )

# def get_user_workspace(
#     workspace_id: int,
#     current_user: User,
#     db: Session,
# ):
#     workspace = (
#         db.query(Workspace)
#         .filter(
#             Workspace.id == workspace_id,
#             Workspace.user_id == current_user.id,
#         )
#         .first()
#     )

#     if not workspace:
#         raise HTTPException(
#             status_code=404,
#             detail="Workspace not found",
#         )

#     return workspace


# @router.post(
#     "/",
#     response_model=SourceResponse,
#     status_code=201,
# )
# def create_source(
#     workspace_id: int,
#     data: SourceCreate,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     get_user_workspace(workspace_id, current_user, db)

#     source = Source(
#         workspace_id=workspace_id,
#         title=data.title,
#         source_type=data.source_type,
#         file_url=data.file_url,
#     )

#     db.add(source)
#     db.commit()
#     db.refresh(source)

#     return source


# @router.get(
#     "/",
#     response_model=list[SourceResponse],
# )
# def get_sources(
#     workspace_id: int,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     get_user_workspace(workspace_id, current_user, db)

#     sources = (
#         db.query(Source)
#         .filter(Source.workspace_id == workspace_id)
#         .order_by(Source.created_at.desc())
#         .all()
#     )

#     return sources


# @router.get(
#     "/{source_id}",
#     response_model=SourceResponse,
# )
# def get_source(
#     workspace_id: int,
#     source_id: int,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     get_user_workspace(workspace_id, current_user, db)

#     source = (
#         db.query(Source)
#         .filter(
#             Source.id == source_id,
#             Source.workspace_id == workspace_id,
#         )
#         .first()
#     )

#     if not source:
#         raise HTTPException(
#             status_code=404,
#             detail="Source not found",
#         )

#     return source

# @router.post(
#     "/upload",
#     response_model=SourceResponse,
#     status_code=201,
# )
# async def upload_source(
#     workspace_id: int,
#     file: UploadFile = File(...),
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     get_user_workspace(workspace_id, current_user, db)

#     if file.content_type != "application/pdf":
#         raise HTTPException(
#             status_code=400,
#             detail="Only PDF files are allowed",
#         )

#     upload_dir = Path("uploads") / "workspaces" / str(workspace_id)
#     upload_dir.mkdir(parents=True, exist_ok=True)

#     file_name = f"{uuid4()}.pdf"
#     file_path = upload_dir / file_name

#     with file_path.open("wb") as buffer:
#         while chunk := await file.read(1024 * 1024):
#             buffer.write(chunk)

#     source = Source(
#         workspace_id=workspace_id,
#         title=file.filename or "Untitled PDF",
#         source_type="pdf",
#         file_url=str(file_path),
#         status="uploaded",
#     )

#     db.add(source)
#     db.commit()
#     db.refresh(source)

#     return source

# @router.delete("/{source_id}")
# def delete_source(
#     workspace_id: int,
#     source_id: int,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     get_user_workspace(workspace_id, current_user, db)

#     source = (
#         db.query(Source)
#         .filter(
#             Source.id == source_id,
#             Source.workspace_id == workspace_id,
#         )
#         .first()
#     )

#     if not source:
#         raise HTTPException(
#             status_code=404,
#             detail="Source not found",
#         )

#     db.delete(source)
#     db.commit()

#     return {"message": "Source deleted successfully"}