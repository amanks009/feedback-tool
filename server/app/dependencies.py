# dependencies.py
from fastapi import Depends, HTTPException, status
from .security import get_current_user
from .schemas import UserOut

async def get_manager_user(current_user: UserOut = Depends(get_current_user)):
    if current_user.role != "Manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can access this resource"
        )
    return current_user

async def get_employee_user(current_user: UserOut = Depends(get_current_user)):
    if current_user.role != "Employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can access this resource"
        )
    return current_user