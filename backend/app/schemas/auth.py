from pydantic import BaseModel, EmailStr
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    user_name: str

class RegisterResponse(BaseModel):
    id: int
    email: EmailStr
    user_name: str

    class Config:
        from_attributes = True        

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    user_name: str
    is_active: bool
    email_verified: bool

    class Config:
        from_attributes = True

class RefreshRequest(BaseModel):
    refresh_token: str

class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProfileResponse(BaseModel):
    user_id: int
    name: str
    profile_image: str | None
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdateRequest(BaseModel):
    name: str
    profile_image: str | None = None