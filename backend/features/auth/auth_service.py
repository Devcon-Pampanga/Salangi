from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from backend.db.database import Base
from fastapi import HTTPException
from pathlib import Path
from dotenv import load_dotenv
import urllib.request
import json
import os

env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    profile_pic = Column(String, nullable=True)


def update_supabase_metadata(user_id: str, first_name: str, last_name: str):
    try:
        url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
        payload = json.dumps({
            "user_metadata": {
                "first_name": first_name,
                "last_name": last_name,
            }
        }).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            method="PUT",
            headers={
                "Content-Type": "application/json",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            }
        )
        with urllib.request.urlopen(req) as res:
            print(f"✅ Supabase metadata updated: {res.status}")
    except Exception as e:
        print(f"⚠️ Supabase metadata update failed: {e}")


def delete_supabase_user(user_id: str):
    try:
        url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
        req = urllib.request.Request(
            url,
            method="DELETE",
            headers={
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            }
        )
        with urllib.request.urlopen(req) as res:
            print(f"✅ Supabase user deleted: {res.status}")
    except Exception as e:
        print(f"⚠️ Supabase user deletion failed: {e}")


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

    if request.first_name is not None:
        user.first_name = request.first_name
    if request.last_name is not None:
        user.last_name = request.last_name
    if request.email is not None:
        user.email = request.email

    db.commit()
    db.refresh(user)

    # Update Supabase user_metadata
    update_supabase_metadata(user_id, user.first_name, user.last_name)

    return {
        "message": "Profile updated successfully.",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
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