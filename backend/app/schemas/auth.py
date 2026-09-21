from pydantic import BaseModel, EmailStr, Field, field_validator,model_validator
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    user_name: str = Field(min_length=3, max_length=50)

    @field_validator("user_name")
    @classmethod
    def validate_user_name(cls, value:str):
        value = value.strip()

        if not value:
            raise ValueError("Name is required")
        if not any(char.isalpha() for char in value):
            raise ValueError("Name must contain letters")
        if not all(char.isalpha() or char.isspace() for char in value):
            raise ValueError("Name can contain only letters and space")
        return value

    @field_validator("password") 
    @classmethod 
    def validate_password(cls, value: str): 
        if not any(char.isupper() for char in value): 
            raise ValueError( "Password must contain at least one uppercase letter" ) 
        if not any(char.islower() for char in value): 
            raise ValueError( "Password must contain at least one lowercase letter" ) 
        if not any(char.isdigit() for char in value): 
            raise ValueError( "Password must contain at least one number" ) 
        return value

    @model_validator(mode="after")
    def validate_password_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Password do not match")
        return self

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
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str): 
        if not any(char.isupper() for char in value): 
            raise ValueError( "Password must contain at least one uppercase letter" ) 
        if not any(char.islower() for char in value): 
            raise ValueError( "Password must contain at least one lowercase letter" ) 
        if not any(char.isdigit() for char in value): 
            raise ValueError( "Password must contain at least one number" ) 
        return value


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