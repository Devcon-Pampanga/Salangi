from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from features.auth.auth_schema import RegisterRequest, AuthResponse
from features.auth.auth_service import register_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(request, db)