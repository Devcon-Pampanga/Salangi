from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.features.auth.auth_schema import (
    RegisterRequest, AuthResponse, LoginRequest,
    UpdateProfileRequest, ChangePasswordRequest
)
from backend.features.auth.auth_service import (
    register_user, login_user, verify_email,
    update_profile, change_password, delete_account
)
from backend.core.security import decode_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def get_current_user_id(authorization: str = Header(...)) -> int:
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return payload["user_id"]


@router.post("/register", response_model=dict)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(request, db)


@router.get("/verify-email")
def verify(token: str, db: Session = Depends(get_db)):
    return verify_email(token, db)


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return login_user(request, db)


@router.put("/update-profile", response_model=dict)
def update(request: UpdateProfileRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return update_profile(user_id, request, db)


@router.put("/change-password", response_model=dict)
def change_pw(request: ChangePasswordRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return change_password(user_id, request, db)


@router.delete("/delete-account", response_model=dict)
def delete(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return delete_account(user_id, db)