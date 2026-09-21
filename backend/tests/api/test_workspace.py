from app.models.users import User
from app.models.workspaces import Workspace
from app.services.auth import hash_password


def test_create_workspace(client, db_session):
    user = User(
        email="workspace@example.com",
        password_hash=hash_password("StrongPassword123"),
        user_name="Workspace User",
        email_verified=True,
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    login_response = client.post(
        "/auth/login",
        json={
            "email": "workspace@example.com",
            "password": "StrongPassword123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.post(
        "/workspaces/",
        json={
            "name": "Test Workspace",
            "description": "Workspace for pytest",
        },
        headers={
            "Authorization": f"Bearer {access_token}"
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test Workspace"
    assert data["description"] == "Workspace for pytest"

    workspace = (
        db_session.query(Workspace)
        .filter(Workspace.id == data["id"])
        .first()
    )

    assert workspace is not None
    assert workspace.user_id == user.id