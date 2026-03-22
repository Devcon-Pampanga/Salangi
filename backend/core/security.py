import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def generate_verification_token(email: str) -> str:
    s = URLSafeTimedSerializer(os.getenv("JWT_SECRET", "your-secret-key"))
    return s.dumps(email, salt="email-verify")

def confirm_verification_token(token: str, expiration=86400):
    s = URLSafeTimedSerializer(os.getenv("JWT_SECRET", "your-secret-key"))
    try:
        email = s.loads(token, salt="email-verify", max_age=expiration)
    except Exception:
        return None
    return email