from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from features.auth.auth_schema import RegisterRequest
from features.auth.auth_service import register_user, verify_email

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=dict)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(request, db)

@router.get("/verify-email")
def verify(token: str, db: Session = Depends(get_db)):
    return verify_email(token, db)