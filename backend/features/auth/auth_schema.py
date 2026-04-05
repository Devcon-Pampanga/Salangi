from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    first_name: str
    last_name:  str
    email:      EmailStr
    password:   str

class AuthResponse(BaseModel):
    token:      str
    user_id:    str
    first_name: str
    last_name:  str
    email:      str

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name:  str
    email:      EmailStr

class ChangePasswordRequest(BaseModel):
    new_password: str