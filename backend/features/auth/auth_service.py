from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String
from backend.db.database import Base
from backend.core.security import hash_password, verify_password, create_token
from backend.features.auth.auth_schema import RegisterRequest, LoginRequest
from fastapi import HTTPException

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


def register_user(request: RegisterRequest, db: Session):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already in use.")

    hashed = hash_password(request.password)

    new_user = User(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password=hashed
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token(new_user.user_id, new_user.email)

    return {
        "token": token,
        "user_id": new_user.user_id,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email
    }


def login_user(request: LoginRequest, db: Session):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user.user_id, user.email)
    return {
        "token": token,
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    }