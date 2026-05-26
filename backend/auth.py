from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from fastapi import Header, HTTPException

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
EXPIRE_MIN = 60 * 8  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# HASH / VERIFY PASSWORDS
# -------------------------

def verificar_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def hash_password(password):
    return pwd_context.hash(password)

# -------------------------
# JWT
# -------------------------

def crear_token(rol: str):
    exp = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)

    payload = {
        "rol": rol,
        "exp": exp
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_role(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(401, "No token")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["rol"]
    except:
        raise HTTPException(401, "Token inválido")
