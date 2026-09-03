from pydantic import BaseModel, EmailStr

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