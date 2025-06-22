from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from .auth import register_user, RegisterUser
from .security import (
    get_current_user,
    create_access_token,
    verify_password,
    oauth2_scheme
)
from .dependencies import get_manager_user, get_employee_user
from .schemas import UserOut, Token, FeedbackOut
from prisma import Prisma
from datetime import timedelta
from typing import List, Dict, Any

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
prisma = Prisma()

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

# Auth endpoints
@app.post("/register")
async def register(user_data: RegisterUser):
    try:
        user = await register_user(user_data)
        return {"message": "User created successfully", "user_id": user.id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await prisma.user.find_unique(where={"email": form_data.username})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=60 * 24)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "role": user.role.name},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": user.role.name
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/me")
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

# Manager endpoints
@app.get("/dashboard")
async def manager_dashboard(current_user: UserOut = Depends(get_manager_user)):
    try:
        employees = await prisma.user.find_many(
            where={"managerId": current_user.id},
            include={"feedbacks": True}
        )
        
        team_data = []
        for emp in employees:
            feedback_count = len(emp.feedbacks)
            sentiments = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0}
            
            for fb in emp.feedbacks:
                sentiments[fb.sentiment.name] += 1
            
            team_data.append({
                "employee": {
                    "id": emp.id,
                    "name": emp.name,
                    "email": emp.email,
                    "role": emp.role.name
                },
                "feedback_count": feedback_count,
                "sentiments": sentiments
            })
        
        return {"team": team_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e))

@app.get("/feedback/{employee_id}")
async def get_employee_feedback(
    employee_id: int,
    current_user: UserOut = Depends(get_manager_user)
):
    try:
        employee = await prisma.user.find_unique(
            where={"id": employee_id},
            include={"manager": True}
        )
        
        if not employee or employee.managerId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this employee's feedback"
            )
        
        feedbacks = await prisma.feedback.find_many(
            where={"employeeId": employee_id},
            order={"createdAt": "desc"}
        )
        
        return feedbacks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e))

@app.post("/feedback")
async def create_feedback(
    feedback_data: dict,
    current_user: UserOut = Depends(get_manager_user)
):
    try:
        employee = await prisma.user.find_unique(
            where={"id": feedback_data["employee_id"]},
            include={"manager": True}
        )
        
        if not employee or employee.managerId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to provide feedback to this employee"
            )
        
        new_feedback = await prisma.feedback.create({
            "strengths": feedback_data["strengths"],
            "areasToImprove": feedback_data["areasToImprove"],
            "sentiment": feedback_data["sentiment"],
            "employeeId": feedback_data["employee_id"],
            "managerId": current_user.id
        })
        
        return {"message": "Feedback created successfully", "feedback": new_feedback}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e))

# Employee endpoints

@app.get("/employee-dashboard")
async def employee_dashboard(current_user: UserOut = Depends(get_employee_user)):
    try:
        print(f"Fetching feedback for employee ID: {current_user.id}")
        
        # Get all feedback for the current employee
        feedbacks = await prisma.feedback.find_many(
            where={
                "employeeId": current_user.id
            },
            order={
                "createdAt": "desc"
            },
            include={
                "manager": True  # Include the full manager object
            }
        )
        
        print(f"Found {len(feedbacks)} feedback records")
        
        # Format the response
        timeline = []
        for fb in feedbacks:
            # Handle sentiment (it might be a string or enum)
            sentiment = fb.sentiment.name if hasattr(fb.sentiment, 'name') else str(fb.sentiment)
            
            timeline.append({
                "id": fb.id,
                "sentiment": sentiment,  # Use processed sentiment
                "strengths": fb.strengths,
                "areasToImprove": fb.areasToImprove,
                "acknowledged": fb.acknowledged,
                "createdAt": fb.createdAt,
                "managerName": fb.manager.name if fb.manager else "Unknown Manager"
            })
        
        return {"timeline": timeline}
        
    except Exception as e:
        print(f"Error in employee_dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/acknowledge/{feedback_id}")
async def acknowledge_feedback(
    feedback_id: int,
    current_user: UserOut = Depends(get_employee_user)
):
    try:
        feedback = await prisma.feedback.find_unique(
            where={"id": feedback_id}
        )
        
        if not feedback or feedback.employeeId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to acknowledge this feedback"
            )
        
        updated_feedback = await prisma.feedback.update(
            where={"id": feedback_id},
            data={"acknowledged": True}
        )
        
        return {"message": "Feedback acknowledged successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e))