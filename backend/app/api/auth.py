from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from datetime import datetime,timedelta

from app.db.dependencies import get_db

from app.models.users import User
from app.models.email_verification import EmailVerification
from app.models.refresh_token import RefreshToken
from app.models.password_reset_token import PasswordResetToken

from app.schemas.auth import (RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, UserResponse, 
                              RefreshRequest, RefreshResponse, ResetPasswordRequest)

from app.services.auth import hash_password, verify_password, hash_refresh_token, generate_password_reset_token, hash_password_reset_token
from app.services.email_verification import (generate_verication_token,hash_verification_token)

from app.worker.tasks import send_verification_email_task, send_password_reset_email_task

from app.core.config import settings
from app.core.oauth import oauth

from app.core.security import create_access_token,create_refresh_token, get_current_user, verify_refresh_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


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

    verification_token = generate_verication_token()
    token_hash = hash_verification_token(verification_token)

    verification = EmailVerification(user_id=new_user.id,
                                     token_hash=token_hash,
                                     expires_at=datetime.utcnow() + timedelta(hours=24),
                                     created_at=datetime.utcnow(),)
    db.add(verification)
    db.commit()

    verification_url = ( f"http://localhost:8000/auth/verify-email?token={verification_token}")

    send_verification_email_task.delay(recipient=new_user.email,verification_url=verification_url,)

    return new_user
    

@router.get("/verify-email")
def verify_email(token: str, db:Session = Depends(get_db)):
    token_hash = hash_verification_token(token)

    verification = (db.query(EmailVerification).filter(EmailVerification.token_hash == token_hash).first())

    if not verification:
        raise HTTPException(status_code=400,detail="Invalid verification token")

    if verification.verified_at is not None:
        raise HTTPException(status_code=400,detail="Email already verified")

    if verification.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400,detail="Verification token has expired")

    user = (db.query(User).filter(User.id == verification.user_id).first())

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    user.email_verified = True
    verification.verified_at = datetime.utcnow()

    db.commit()

    return {"message":"Email verified successfully"}

@router.post("/login", response_model=LoginResponse)
def login_user(user_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password,user.password_hash):
        raise HTTPException(status_code=401,detail="Invalid email or password",)

    if not user.is_active:
        raise HTTPException(status_code=403,detail="Account is inactive")

    if not user.email_verified:
        raise HTTPException(status_code=403,detail="Please verify your email first")

    user.last_login_at = datetime.utcnow()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    refresh_token_record = RefreshToken(user_id=user.id,token_hash=hash_refresh_token(refresh_token),
                                        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
                                        created_at=datetime.utcnow(),)
    db.add(refresh_token_record)
    db.commit()

    return {"access_token": access_token,"refresh_token": refresh_token,"token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/refresh", response_model=RefreshResponse)
def refresh_access_token(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    user_id = verify_refresh_token(refresh_data.refresh_token)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403,detail="Account is inactive")

    stored_token = (db.query(RefreshToken).filter(RefreshToken.token_hash == hash_refresh_token(refresh_data.refresh_token),
                                                  RefreshToken.revoked_at.is_(None),).first())

    if not stored_token:
        raise HTTPException(status_code=401,detail="Invalid or revoked refresh token",)

    if stored_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401,detail="Refresh token has expired",)

    stored_token.revoked_at = datetime.utcnow()

    access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)

    new_refresh_token_record = RefreshToken(user_id=user.id,token_hash=hash_refresh_token(new_refresh_token),
                                            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
                                            created_at=datetime.utcnow(),)

    db.add(new_refresh_token_record)
    db.commit()

    return {"access_token": access_token,"refresh_token": new_refresh_token,"token_type": "bearer",}

@router.post("/logout")
def logout_user(refresh_data: RefreshRequest,db: Session = Depends(get_db)):
    stored_token = (db.query(RefreshToken).filter(RefreshToken.token_hash == hash_refresh_token(refresh_data.refresh_token),
                                                  RefreshToken.revoked_at.is_(None),).first())

    if not stored_token:
        raise HTTPException(status_code=401,detail="Invalid or already refresh token")
    stored_token.revoked_at = datetime.utcnow()
    db.commit()

    return {"message":"Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(email: str,db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if user:
        reset_token = generate_password_reset_token()

        reset_record = PasswordResetToken(user_id=user.id,
                                          token_hash=hash_password_reset_token(reset_token),
                                          expires_at=datetime.utcnow() + timedelta(minutes=30),
                                          created_at=datetime.utcnow())
        db.add(reset_record)
        db.commit()

        reset_url = (f"http://localhost:8000/auth/reset-password?token={reset_token}")

        send_password_reset_email_task.delay(recipient=user.email,reset_url=reset_url,)

    return {"message":"If the email is registered,a password reset link has been sent"}    

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest,db: Session = Depends(get_db)):
    token_hash = hash_password_reset_token(data.token)

    reset_record = (db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash,PasswordResetToken.used_at.is_(None),).first())

    if not reset_record:
        raise HTTPException(status_code=400,detail="Invalid or already used reset token")

    if reset_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400,detail="Reset token has expired")

    user = (db.query(User).filter(User.id == reset_record.user_id).first())

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    user.password_hash = hash_password(data.new_password)

    reset_record.used_at = datetime.utcnow()

    db.commit()

    return {"message":"Password reset successfull"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    return await oauth.google.authorize_redirect(request,redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)

    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400,detail="Could not retrieve Google user information",)

    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")

    user = (db.query(User).filter(User.email == email).first())

    if user:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    new_user = User(email=email,user_name=name,password_hash=None,is_active=True,email_verified=True,)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(new_user.id)
    refresh_token = create_refresh_token(new_user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }
