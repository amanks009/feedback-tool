# security.py
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from datetime import datetime, timedelta
from passlib.context import CryptContext
from prisma import Prisma
from .schemas import TokenData, UserOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "my-jwt-secret-key-for-employee-management-system-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    prisma = Prisma()
    await prisma.connect()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id, role=role)
    except JWTError:
        raise credentials_exception
    
    user = await prisma.user.find_unique(where={"id": token_data.user_id})
    await prisma.disconnect()
    if user is None:
        raise credentials_exception
    
    user_role = user.role.name if hasattr(user.role, 'name') else str(user.role)
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user_role,
        managerId=getattr(user, 'managerId', None),
        created_at=getattr(user, 'created_at', None) or getattr(user, 'createdAt', None),
        updated_at=getattr(user, 'updated_at', None) or getattr(user, 'updatedAt', None)
    )

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)