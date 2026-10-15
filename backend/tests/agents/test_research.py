from app.models.users import User
from app.models.workspaces import Workspace
from app.models.research import ResearchTask
from app.services.auth import hash_password


def test_create_research(client, db_session):
    user = User(
        email="research@example.com",
        password_hash=hash_password("StrongPassword123"),
        user_name="Research User",
        email_verified=True,
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    workspace = Workspace(
        user_id=user.id,
        name="Research Workspace",
        description="Workspace for research",
    )

    db_session.add(workspace)
    db_session.commit()
    db_session.refresh(workspace)

    login_response = client.post(
        "/auth/login",
        json={
            "email": "research@example.com",
            "password": "StrongPassword123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.post(
        "/research/",
        json={
            "workspace_id": workspace.id,
            "query": "Compare RAG and fine-tuning",
        },
        headers={
            "Authorization": f"Bearer {access_token}"
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["workspace_id"] == workspace.id
    assert data["query"] == "Compare RAG and fine-tuning"
    assert data["status"] == "pending"
    assert data["current_step"] == 0
    assert data["progress"] == 0

    research = (
        db_session.query(ResearchTask)
        .filter(ResearchTask.id == data["id"])
        .first()
    )

    assert research is not None
    assert research.user_id == user.id
    assert research.workspace_id == workspace.id

def test_get_research(client, db_session):
    user = User(
        email="getresearch@example.com",
        password_hash=hash_password("StrongPassword123"),
        user_name="Research User",
        email_verified=True,
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    workspace = Workspace(
        user_id=user.id,
        name="Research Workspace",
        description="Test workspace",
    )

    db_session.add(workspace)
    db_session.commit()
    db_session.refresh(workspace)

    research = ResearchTask(
        user_id=user.id,
        workspace_id=workspace.id,
        query="What is hybrid search?",
        status="pending",
        current_step=0,
        progress=0,
    )

    db_session.add(research)
    db_session.commit()
    db_session.refresh(research)

    login_response = client.post(
        "/auth/login",
        json={
            "email": "getresearch@example.com",
            "password": "StrongPassword123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.get(
        f"/research/{research.id}",
        headers={
            "Authorization": f"Bearer {access_token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == research.id
    assert data["query"] == "What is hybrid search?"
    assert data["status"] == "pending"
    assert data["progress"] == 0

def test_get_research_other_user_forbidden(client, db_session):
    owner = User(
        email="owner@example.com",
        password_hash=hash_password("StrongPassword123"),
        user_name="Owner",
        email_verified=True,
        is_active=True,
    )

    other_user = User(
        email="other@example.com",
        password_hash=hash_password("StrongPassword123"),
        user_name="Other User",
        email_verified=True,
        is_active=True,
    )

    db_session.add_all([owner, other_user])
    db_session.commit()

    workspace = Workspace(
        user_id=owner.id,
        name="Owner Workspace",
    )

    db_session.add(workspace)
    db_session.commit()
    db_session.refresh(workspace)

    research = ResearchTask(
        user_id=owner.id,
        workspace_id=workspace.id,
        query="Private research",
        status="pending",
    )

    db_session.add(research)
    db_session.commit()
    db_session.refresh(research)

    login_response = client.post(
        "/auth/login",
        json={
            "email": "other@example.com",
            "password": "StrongPassword123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.get(
        f"/research/{research.id}",
        headers={
            "Authorization": f"Bearer {access_token}"
        },
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Research task not found"
    }