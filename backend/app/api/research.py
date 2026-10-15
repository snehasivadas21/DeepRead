from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.models.research import ResearchTask
from app.models.users import User
from app.models.workspaces import Workspace
from app.models.research_step import ResearchStep
from app.models.research_evidence import ResearchEvidence

from app.schemas.research import ResearchCreate, ResearchResponse, ResearchDetailsResponse, ResearchEvidenceDetail, ResearchStepDetail
from app.core.security import get_current_user
from app.worker.tasks import run_research_task


router = APIRouter(
    prefix="/research",
    tags=["Research"],
)


@router.post(
    "/",
    response_model=ResearchResponse,
    status_code=201,
)
def create_research(
    data: ResearchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    research_task = ResearchTask(
        user_id=current_user.id,
        workspace_id=data.workspace_id,
        query=data.query,
        status="pending",
        current_step=0,
        progress=0,
    )

    db.add(research_task)
    db.commit()
    db.refresh(research_task)

    run_research_task.delay(research_task.id)

    return research_task

@router.get(
    "/",
    response_model=list[ResearchResponse],
)
def get_research_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    research_tasks = (
        db.query(ResearchTask)
        .filter(
            ResearchTask.user_id == current_user.id,
        )
        .order_by(
            ResearchTask.created_at.desc()
        )
        .all()
    )

    return research_tasks

@router.get(
    "/{research_id}",
    response_model=ResearchResponse,
)
def get_research(
    research_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    research_task = (
        db.query(ResearchTask)
        .filter(
            ResearchTask.id == research_id,
            ResearchTask.user_id == current_user.id,
        )
        .first()
    )

    if not research_task:
        raise HTTPException(
            status_code=404,
            detail="Research task not found",
        )

    return research_task

@router.get(
    "/{research_id}/details",
    response_model=ResearchDetailsResponse,
)
def get_research_details(
    research_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    research_task = (
        db.query(ResearchTask)
        .filter(
            ResearchTask.id == research_id,
            ResearchTask.user_id == current_user.id,
        )
        .first()
    )

    if not research_task:
        raise HTTPException(
            status_code=404,
            detail="Research task not found",
        )

    steps = (
        db.query(ResearchStep)
        .filter(
            ResearchStep.research_task_id == research_task.id
        )
        .order_by(ResearchStep.step_number.asc())
        .all()
    )

    evidence_records = (
        db.query(ResearchEvidence)
        .filter(
            ResearchEvidence.research_task_id == research_task.id
        )
        .order_by(ResearchEvidence.id.asc())
        .all()
    )

    evidence_by_step = {}

    for item in evidence_records:
        evidence_by_step.setdefault(item.step_id, []).append(
            ResearchEvidenceDetail.model_validate(item)
        )

    step_details = [
        ResearchStepDetail(
            id=step.id,
            step_number=step.step_number,
            question=step.question,
            status=step.status,
            result=step.result,
            analysis=step.analysis,
            evidence=evidence_by_step.get(step.id, []),
        )
        for step in steps
    ]

    return ResearchDetailsResponse(
        id=research_task.id,
        workspace_id=research_task.workspace_id,
        query=research_task.query,
        status=research_task.status,
        current_step=research_task.current_step,
        progress=research_task.progress,
        report=research_task.report,
        created_at=research_task.created_at,
        updated_at=research_task.updated_at,
        completed_at=research_task.completed_at,
        steps=step_details,
    )