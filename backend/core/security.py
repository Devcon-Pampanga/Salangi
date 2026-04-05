import jwt as pyjwt
from jose import jwt, JWTError
from datetime import datetime, timedelta
import bcrypt
import base64
import json
import urllib.request
import jwt as pyjwt
from jwt.algorithms import ECAlgorithm
from pathlib import Path
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
import base64
import json
import requests as req
import os

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY                  = os.getenv("SECRET_KEY")
ALGORITHM                   = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found in .env")

if not SUPABASE_PROJECT_REF:
    raise ValueError("SUPABASE_PROJECT_REF not found in .env")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "user_id": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_supabase_user_id(token: str) -> str | None:
    try:
        jwks = _get_jwks()
        if not jwks:
            print("❌ Could not fetch JWKS")
            return None

        # Get kid from token header
        header = json.loads(base64.urlsafe_b64decode(
            token.split(".")[0] + "=="
        ))
        kid = header.get("kid")

        # Find matching key
        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                key = k
                break

        if not key:
            print(f"❌ No matching key found for kid: {kid}")
            return None

        from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePublicKey
        from jwt.algorithms import ECAlgorithm

        public_key = ECAlgorithm.from_jwk(json.dumps(key))
        payload = pyjwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            options={"verify_aud": False},
        )
        print(f"✅ Token decoded, user_id: {payload.get('sub')}")
        return payload.get("sub")

    except Exception as e:
        print(f"❌ JWT decode error: {e}")
        return None


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


# ── Supabase JWT (ES256 with JWKS) ───────────────────────────────────────────
def decode_supabase_token(token: str) -> dict | None:
    try:
        jwks_url = f"https://{SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json"
        with urllib.request.urlopen(jwks_url) as response:
            jwks = json.loads(response.read())

        header = pyjwt.get_unverified_header(token)
        kid = header.get("kid")

        public_key = None
        for key in jwks["keys"]:
            if key["kid"] == kid:
                public_key = ECAlgorithm.from_jwk(json.dumps(key))
                break

        if not public_key:
            return None

        payload = pyjwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            options={"verify_aud": False},
        )
        return payload
    except Exception:
        return None


def get_supabase_user_id(token: str) -> str | None:
    payload = decode_supabase_token(token)
    if not payload:
        return None
    return payload.get("sub")