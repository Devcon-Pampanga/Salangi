from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean
from backend.db.database import Base
from backend.core.security import hash_password, verify_password, create_token, generate_verification_token, confirm_verification_token
from backend.core.email import send_verification_email
from backend.features.auth.auth_schema import RegisterRequest, LoginRequest

from fastapi import HTTPException
import dns.resolver
import os


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)


def is_email_real(email: str) -> bool:
    domain = email.split("@")[1]
    try:
        dns.resolver.resolve(domain, "MX")
        return True
    except Exception:
        return False


def register_user(request: RegisterRequest, db: Session):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already in use.")

    if not is_email_real(request.email):
        raise HTTPException(status_code=400, detail="Email does not exist. Please use a real email address.")

    hashed = hash_password(request.password)

    new_user = User(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password=hashed,
        is_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verification_token = generate_verification_token(new_user.email)
    try:
        send_verification_email(new_user.email, verification_token)
    except Exception as e:
        print(f"Email sending failed: {e}")

    return {"message": "Registration successful. Please check your email to verify your account."}


def verify_email(token: str, db: Session):
    email = confirm_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified.")

    user.is_verified = True
    db.commit()

    return {"message": "Email verified successfully. You can now log in."}

def login_user(request: LoginRequest, db: Session):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please check your email.")

    token = create_token(user.user_id, user.email)

    return {
        "token": token,
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    }

