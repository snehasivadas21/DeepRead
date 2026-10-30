from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user

from app.models.users import User
from app.models.workspaces import Workspace
from app.models.evaluation import EvaluationCase, EvaluationDataset
from app.models.evaluation_run import EvaluationRun
from app.models.sources import Source
from app.models.document_chunks import DocumentChunk

from app.services.evaluation_service import evaluate_retrieval

from app.schemas.evaluation import EvaluationRunResponse, EvaluationResultResponse, EvaluationCaseCreate, EvaluationDatasetCreate


router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"],
)


@router.post("/run", response_model=EvaluationResultResponse)
def run_evaluation(
    case_id: int,
    top_k: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    case = (
        db.query(EvaluationCase)
        .filter(
            EvaluationCase.id == case_id,
            EvaluationCase.is_active == True,
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Evaluation case not found",
        )

    from app.models.evaluation import EvaluationDataset

    dataset = (
        db.query(EvaluationDataset)
        .filter(
            EvaluationDataset.id == case.dataset_id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Evaluation dataset not found",
        )

    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == dataset.workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    if top_k < 1 or top_k > 100:
        raise HTTPException(
            status_code=400,
            detail="top_k must be between 1 and 100",
        )

    try:
        result = evaluate_retrieval(
            db=db,
            question=case.question,
            workspace_id=workspace.id,
            relevant_chunk_ids=case.relevant_chunk_ids or [],
            top_k=top_k,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
 
    evaluation_run = EvaluationRun(
        dataset_id=dataset.id,
        case_id=case.id,
        user_id=current_user.id,
        question=result["question"],
        top_k=result["top_k"],
        precision_at_k=result["precision_at_k"],
        recall_at_k=result["recall_at_k"],
        f1_at_k=result["f1_at_k"],
        retrieved_chunk_ids=result["retrieved_chunk_ids"],
        relevant_chunk_ids=result["relevant_chunk_ids"],
        answer=result["answer"],
        answer_relevance=result["answer_relevance"],
        faithfulness=result["faithfulness"],
    )

    db.add(evaluation_run)
    db.commit()
    db.refresh(evaluation_run)

    return {
        "run_id": evaluation_run.id,
        "case_id": case.id,
        "dataset_id": dataset.id,
        "workspace_id": workspace.id,
        **result,
    }


@router.get("/history",response_model=list[EvaluationRunResponse])
def get_evaluation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    evaluation_runs = (
        db.query(EvaluationRun)
        .join(
            EvaluationDataset,
            EvaluationRun.dataset_id == EvaluationDataset.id,
        )
        .join(
            Workspace,
            EvaluationDataset.workspace_id == Workspace.id,
        )
        .filter(
            EvaluationRun.user_id == current_user.id,
            Workspace.user_id == current_user.id,
        )
        .order_by(EvaluationRun.created_at.desc())
        .all()
    )
    return evaluation_runs

@router.get("/datasets")
def list_evaluation_datasets(
    workspace_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
        raise HTTPException(status_code=404, detail="Workspace not found")

    return (
        db.query(EvaluationDataset)
        .filter(EvaluationDataset.workspace_id == workspace_id)
        .order_by(EvaluationDataset.created_at.desc())
        .all()
    )


@router.get("/datasets/{dataset_id}/cases")
def list_evaluation_cases(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset = (
        db.query(EvaluationDataset)
        .join(Workspace, EvaluationDataset.workspace_id == Workspace.id)
        .filter(
            EvaluationDataset.id == dataset_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(status_code=404, detail="Evaluation dataset not found")

    return (
        db.query(EvaluationCase)
        .filter(
            EvaluationCase.dataset_id == dataset_id,
            EvaluationCase.is_active == True,
        )
        .order_by(EvaluationCase.created_at.desc())
        .all()
    )

@router.post("/datasets")
def create_evaluation_dataset(
    data: EvaluationDatasetCreate,
    workspace_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
        raise HTTPException(status_code=404, detail="Workspace not found")

    dataset = EvaluationDataset(
        name=data.name.strip(),
        workspace_id=workspace.id,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset

@router.post("/datasets/{dataset_id}/cases")
def create_evaluation_case(
    dataset_id: int,
    data: EvaluationCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset = (
        db.query(EvaluationDataset)
        .join(Workspace, EvaluationDataset.workspace_id == Workspace.id)
        .filter(
            EvaluationDataset.id == dataset_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Evaluation dataset not found",
        )

    chunk_ids = set(data.relevant_chunk_ids)

    if chunk_ids:
        valid_chunk_ids = {
            chunk_id
            for (chunk_id,) in (
                db.query(DocumentChunk.id)
                .join(Source, DocumentChunk.source_id == Source.id)
                .filter(
                    Source.workspace_id == dataset.workspace_id,
                    DocumentChunk.id.in_(chunk_ids),
                )
                .all()
            )
        }

        invalid_ids = chunk_ids - valid_chunk_ids

        if invalid_ids:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Some relevant chunk IDs do not belong to this "
                    f"workspace: {sorted(invalid_ids)}"
                ),
            )

    case = EvaluationCase(
        dataset_id=dataset.id,
        question=data.question.strip(),
        expected_answer=data.expected_answer,
        relevant_chunk_ids=data.relevant_chunk_ids,
    )

    db.add(case)
    db.commit()
    db.refresh(case)

    return case

