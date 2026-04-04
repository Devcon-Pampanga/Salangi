from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from backend.db.database import Base
from backend.core.security import hash_password, verify_password, create_token, generate_verification_token, confirm_verification_token
from backend.core.email import send_verification_email
from fastapi import HTTPException
from pathlib import Path
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
import requests
import os

env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL              = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_executor = ThreadPoolExecutor(max_workers=2)


class User(Base):
    __tablename__ = "users"

    user_id     = Column(String, primary_key=True, index=True)
    first_name  = Column(String, nullable=False)
    last_name   = Column(String, nullable=False)
    email       = Column(String, unique=True, nullable=False)
    profile_pic = Column(String, nullable=True)


def _do_update_supabase_metadata(user_id: str, first_name: str, last_name: str):
    try:
        url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
        res = requests.put(
            url,
            json={"user_metadata": {"first_name": first_name, "last_name": last_name}},
            headers={
                "apikey":        SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            },
            timeout=5.0
        )
        print(f"✅ Supabase metadata updated: {res.status_code}")
    except Exception as e:
        print(f"⚠️ Supabase metadata update failed: {e}")


def update_supabase_metadata(user_id: str, first_name: str, last_name: str):
    _executor.submit(_do_update_supabase_metadata, user_id, first_name, last_name)


def _do_delete_supabase_user(user_id: str):
    try:
        url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
        res = requests.delete(
            url,
            headers={
                "apikey":        SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            },
            timeout=5.0
        )
        print(f"✅ Supabase user deleted: {res.status_code}")
    except Exception as e:
        print(f"⚠️ Supabase user deletion failed: {e}")


def delete_supabase_user(user_id: str):
    _executor.submit(_do_delete_supabase_user, user_id)


def register_user(request, db: Session):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered.")

    hashed = hash_password(request.password)
    user = User(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password_hash=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = generate_verification_token(user.email)
    send_verification_email(user.email, token)

    return {"message": "Registration successful. Please verify your email."}


def verify_email(token: str, db: Session):
    email = confirm_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_verified = True
    db.commit()

    return {"message": "Email verified successfully."}


def login_user(request, db: Session):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first.")

    token = create_token(user.user_id, user.email)
    return {
        "token":      token,
        "user_id":    user.user_id,
        "first_name": user.first_name,
        "last_name":  user.last_name,
        "email":      user.email,
    }


def update_profile(user_id: str, request, db: Session):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if request.email:
        existing = db.query(User).filter(
            User.email == request.email,
            User.user_id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use.")

    if request.first_name is not None: user.first_name = request.first_name
    if request.last_name  is not None: user.last_name  = request.last_name
    if request.email      is not None: user.email      = request.email

    db.commit()
    db.refresh(user)

    update_supabase_metadata(user_id, user.first_name, user.last_name)

    return {
        "message":     "Profile updated successfully.",
        "first_name":  user.first_name,
        "last_name":   user.last_name,
        "email":       user.email,
        "profile_pic": user.profile_pic,
    }


def change_password(user_id: str, request, db: Session):
    raise HTTPException(
        status_code=400,
        detail="Password changes are handled by Supabase. Use supabase.auth.updateUser() on the frontend."
    )


def delete_account(user_id: str, db: Session):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.delete(user)
    db.commit()

    delete_supabase_user(user_id)

    return {"message": "Account deleted successfully."}