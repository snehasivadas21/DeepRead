from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_current_user

from app.models.users import User
from app.models.workspaces import Workspace
from app.models.evaluation import EvaluationDataset, EvaluationCase
from app.models.evaluation_run import EvaluationRun

from app.services.evaluation_service import evaluate_answer_quality


@pytest.fixture
def evaluation_setup(client, db_session):
    user = User(
        email="evaluation@example.com",
        user_name="Evaluation User",
        password_hash="test-password-hash",
        is_active=True,
        email_verified=True,
    )
    db_session.add(user)
    db_session.flush()

    workspace = Workspace(
        user_id=user.id,
        name="Evaluation Workspace",
    )
    db_session.add(workspace)
    db_session.flush()

    dataset = EvaluationDataset(
        name="Test Dataset",
        workspace_id=workspace.id,
    )
    db_session.add(dataset)
    db_session.flush()

    case = EvaluationCase(
        dataset_id=dataset.id,
        question="What is Python?",
        expected_answer="Python is a programming language.",
        relevant_chunk_ids=[101, 102],
        is_active=True,
    )
    db_session.add(case)
    db_session.flush()

    app = client.app
    app.dependency_overrides[get_current_user] = lambda: user

    yield {
        "user": user,
        "workspace": workspace,
        "dataset": dataset,
        "case": case,
    }

    app.dependency_overrides.pop(get_current_user, None)


def test_run_evaluation_saves_result(
    client,
    db_session,
    evaluation_setup,
):
    case = evaluation_setup["case"]

    with patch(
        "app.services.evaluation_service.hybrid_search_chunks",
        return_value=[
            {"chunk": type("Chunk", (), {"id": 101})()},
            {"chunk": type("Chunk", (), {"id": 999})()},
        ],
    ), patch(
        "app.services.evaluation_service.rerank_chunks",
        side_effect=lambda query, results, top_k: results[:top_k],
    ):
        response = client.post(
            f"/evaluation/run?case_id={case.id}&top_k=5"
        )

    assert response.status_code == 200

    data = response.json()
    assert data["case_id"] == case.id
    assert data["precision_at_k"] == 0.5
    assert data["recall_at_k"] == 0.5
    assert data["f1_at_k"] == 0.5
    assert "run_id" in data

    saved_run = (
        db_session.query(EvaluationRun)
        .filter(EvaluationRun.id == data["run_id"])
        .first()
    )
    assert saved_run is not None
    assert saved_run.user_id == evaluation_setup["user"].id


def test_evaluation_history_returns_user_runs(
    client,
    db_session,
    evaluation_setup,
):
    setup = evaluation_setup

    # Create a previous evaluation run
    saved_run = EvaluationRun(
        dataset_id=setup["dataset"].id,
        case_id=setup["case"].id,
        user_id=setup["user"].id,
        question=setup["case"].question,
        top_k=5,
        precision_at_k=0.8,
        recall_at_k=0.6,
        f1_at_k=0.6857,
        retrieved_chunk_ids=[101, 102, 103],
        relevant_chunk_ids=[101, 102],
    )
    db_session.add(saved_run)
    db_session.flush()

    response = client.get("/evaluation/history")

    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == saved_run.id
    assert data[0]["question"] == "What is Python?"
    assert data[0]["precision_at_k"] == 0.8


def test_evaluation_history_returns_empty_list(
    client,
    evaluation_setup,
):
    response = client.get("/evaluation/history")

    assert response.status_code == 200
    assert response.json() == []


def test_user_cannot_run_evaluation_for_another_users_workspace(
    client,
    db_session,
    evaluation_setup,
):
    from app.models.users import User
    from app.models.workspaces import Workspace
    from app.models.evaluation import EvaluationDataset, EvaluationCase

    # Create another user's workspace and evaluation case
    other_user = User(
        email="other@example.com",
        user_name="Other User",
        password_hash="test-password-hash",
        is_active=True,
        email_verified=True,
    )
    db_session.add(other_user)
    db_session.flush()

    other_workspace = Workspace(
        user_id=other_user.id,
        name="Private Workspace",
    )
    db_session.add(other_workspace)
    db_session.flush()

    other_dataset = EvaluationDataset(
        name="Private Dataset",
        workspace_id=other_workspace.id,
    )
    db_session.add(other_dataset)
    db_session.flush()

    other_case = EvaluationCase(
        dataset_id=other_dataset.id,
        question="Private question?",
        relevant_chunk_ids=[101],
        is_active=True,
    )
    db_session.add(other_case)
    db_session.flush()

    response = client.post(
        f"/evaluation/run?case_id={other_case.id}&top_k=5"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Workspace not found"


def test_user_cannot_see_another_users_evaluation_history(
    client,
    db_session,
    evaluation_setup,
):
    setup = evaluation_setup

    other_user = User(
        email="history-other@example.com",
        user_name="History Other",
        password_hash="test-password-hash",
        is_active=True,
        email_verified=True,
    )
    db_session.add(other_user)
    db_session.flush()

    other_workspace = Workspace(
        user_id=other_user.id,
        name="Other Workspace",
    )
    db_session.add(other_workspace)
    db_session.flush()

    other_dataset = EvaluationDataset(
        name="Other Dataset",
        workspace_id=other_workspace.id,
    )
    db_session.add(other_dataset)
    db_session.flush()

    other_case = EvaluationCase(
        dataset_id=other_dataset.id,
        question="Other user's question?",
        relevant_chunk_ids=[201],
        is_active=True,
    )
    db_session.add(other_case)
    db_session.flush()

    other_run = EvaluationRun(
        dataset_id=other_dataset.id,
        case_id=other_case.id,
        user_id=other_user.id,
        question=other_case.question,
        top_k=5,
        precision_at_k=1.0,
        recall_at_k=1.0,
        f1_at_k=1.0,
        retrieved_chunk_ids=[201],
        relevant_chunk_ids=[201],
    )
    db_session.add(other_run)
    db_session.flush()

    # The authenticated user should not see the other user's run.
    response = client.get("/evaluation/history")

    assert response.status_code == 200
    assert response.json() == []

def test_evaluate_answer_quality():
    with patch(
        "app.services.evaluation_service.generate_text",
        return_value=(
            '{"answer_relevance": 0.9, '
            '"faithfulness": 0.8, '
            '"explanation": "The answer addresses the question and is supported."}'
        ),
    ):
        result = evaluate_answer_quality(
            question="What is Python?",
            context="Python is a programming language.",
            answer="Python is a programming language.",
        )

    assert result["answer_relevance"] == 0.9
    assert result["faithfulness"] == 0.8
    assert result["answer"] == "Python is a programming language."


def test_evaluate_answer_quality_rejects_invalid_json():
    with patch(
        "app.services.evaluation_service.generate_text",
        return_value="not valid JSON",
    ):
        with pytest.raises(ValueError, match="invalid evaluation result"):
            evaluate_answer_quality(
                question="What is Python?",
                context="Python is a programming language.",
                answer="Python is a programming language.",
            )


def test_evaluate_answer_quality_rejects_out_of_range_scores():
    with patch(
        "app.services.evaluation_service.generate_text",
        return_value=(
            '{"answer_relevance": 1.5, '
            '"faithfulness": 0.8, '
            '"explanation": "Test"}'
        ),
    ):
        with pytest.raises(ValueError, match="between 0.0 and 1.0"):
            evaluate_answer_quality(
                question="What is Python?",
                context="Python is a programming language.",
                answer="Python is a programming language.",
            )
