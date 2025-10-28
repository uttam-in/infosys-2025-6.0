from fastapi import APIRouter, Depends, HTTPException
from controllers.quiz_controller import QuizController
from models.quiz import QuizAttemptCreate, QuizAttemptResponse, QuizAttemptUpdate, DashboardStats
from utils.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

@router.post("/save-attempt", response_model=QuizAttemptResponse)
async def save_quiz_attempt(
    quiz_data: QuizAttemptCreate,
    current_user: dict = Depends(get_current_user)
):
    controller = QuizController()
    return controller.save_quiz_attempt(current_user['id'], quiz_data)

@router.put("/update-attempt/{quiz_id}", response_model=QuizAttemptResponse)
async def update_quiz_attempt(
    quiz_id: int,
    update_data: QuizAttemptUpdate,
    current_user: dict = Depends(get_current_user)
):
    controller = QuizController()
    return controller.update_quiz_attempt(quiz_id, current_user['id'], update_data)

@router.get("/attempt/{quiz_id}", response_model=QuizAttemptResponse)
async def get_quiz_attempt(
    quiz_id: int,
    current_user: dict = Depends(get_current_user)
):
    controller = QuizController()
    attempt = controller.get_quiz_attempt(quiz_id, current_user['id'])
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")
    return attempt

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    controller = QuizController()
    return controller.get_dashboard_stats(current_user['id'])

@router.get("/attempts", response_model=List[QuizAttemptResponse])
async def get_quiz_attempts(current_user: dict = Depends(get_current_user)):
    controller = QuizController()
    return controller.get_user_quiz_attempts(current_user['id'])
