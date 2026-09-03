from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.users import User
from app.schemas.auth import RegisterRequest, RegisterResponse
from app.services.auth import hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=RegisterResponse, status_code=201)
def register_user(user_data: RegisterRequest, db: Session = Depends(get_db),):
    existing_user = (db.query(User).filter(User.email == user_data.email).first())

    if existing_user:
        raise HTTPException(status_code=400,detail="Email already registered",)

    new_user = User(
        email = user_data.email,
        password_hash = hash_password(user_data.password),
        user_name = user_data.user_name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
    
    