from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    managerId: Optional[int] = None
    created_at: Optional[datetime] = None  # Make optional
    updated_at: Optional[datetime] = None  # Make optional
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

class FeedbackOut(BaseModel):
    id: int
    strengths: str
    areasToImprove: str
    sentiment: str
    createdAt: datetime
    updatedAt: datetime
    employeeId: int
    managerId: int
    acknowledged: bool

class EmployeeWithFeedback(BaseModel):
    employee: UserOut
    feedback_count: int
    sentiments: dict