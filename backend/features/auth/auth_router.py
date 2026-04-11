from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.features.auth.auth_schema import UpdateProfileRequest, ChangePasswordRequest
from backend.features.auth.auth_service import (
    update_profile,
    change_password,
    delete_account,
    upgrade_to_business,
)
from backend.core.security import get_supabase_user_id

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ─── Dependency ───────────────────────────────────────────────────────────────

def get_current_user_id(authorization: str = Header(...)) -> str:
    token   = authorization.replace("Bearer ", "").strip()
    user_id = get_supabase_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return user_id


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.put("/update-profile", response_model=dict)
def update(
    request: UpdateProfileRequest,
    db:      Session = Depends(get_db),
    user_id: str     = Depends(get_current_user_id),
):
    return update_profile(user_id, request, db)


@router.put("/change-password", response_model=dict)
def change_pw(
    request: ChangePasswordRequest,
    db:      Session = Depends(get_db),
    user_id: str     = Depends(get_current_user_id),
):
    return change_password(user_id, request, db)


@router.delete("/delete-account", response_model=dict)
def delete(
    db:      Session = Depends(get_db),
    user_id: str     = Depends(get_current_user_id),
):
    return delete_account(user_id, db)


@router.post("/upgrade-to-business", response_model=dict)
def upgrade(
    user_id: str = Depends(get_current_user_id),
):
    return upgrade_to_business(user_id)