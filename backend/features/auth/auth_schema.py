from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: int
    first_name: str
    last_name: str
    email: str
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str