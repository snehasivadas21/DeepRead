from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user(client):
    response = client.post("/auth/register",json={
        "email":"testuser@example.com",
        "password":"StrongPassword123",
        "user_name":"Test User",
    },)
    
    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "testuser@example.com"
    assert data["user_name"] == "Test User"
    assert "password" not in data
    assert "password_hash" not in data

def test_register_duplicate_email(client):
    user_data = {
        "email": "duplicate@example.com",
        "password": "StrongPassword123",
        "user_name": "Duplicate User",
    }  

    first_response = client.post("/auth/register",json=user_data)  

    assert first_response.status_code == 201

    second_response = client.post("/auth/register",json=user_data,)

    assert second_response.status_code == 400
    assert second_response.json() == {"detail":"Email already registered"}
