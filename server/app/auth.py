# auth.py
from pydantic import BaseModel
from .security import (
    verify_password,
    get_password_hash,
    create_access_token,
    oauth2_scheme,
    get_current_user
)
from prisma import Prisma
from fastapi import HTTPException, status

class RegisterUser(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "Manager" or "Employee"
    manager_id: int | None = None

async def register_user(user_data: RegisterUser):
    print(f"Received registration data: {user_data}")
    
    if user_data.role not in ["Manager", "Employee"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'Manager' or 'Employee'."
        )

    if user_data.role == "Employee" and not user_data.manager_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manager ID is required for employees"
        )

    hashed_password = get_password_hash(user_data.password)
    
    prisma = Prisma()
    await prisma.connect()
    
    try:
        existing_user = await prisma.user.find_unique(where={"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        if user_data.role == "Employee":
            manager = await prisma.user.find_unique(where={"id": user_data.manager_id})
            if not manager or manager.role != "Manager":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid manager ID"
                )

        new_user = await prisma.user.create({
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role,
            "managerId": user_data.manager_id if user_data.role == "Employee" else None
        })
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )
    finally:
        await prisma.disconnect()