from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuizAttemptCreate(BaseModel):
    topic: str
    total_questions: int
    score: int = 0
    percentage: float = 0
    status: str = Field(default="incomplete")  # "completed" or "incomplete"
    quiz_data: Optional[str] = None
    user_answers: Optional[str] = None

class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    total_questions: int
    score: int
    percentage: float
    status: str
    quiz_data: Optional[str] = None
    user_answers: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

class QuizAttemptUpdate(BaseModel):
    score: Optional[int] = None
    percentage: Optional[float] = None
    status: Optional[str] = None
    user_answers: Optional[str] = None

class DashboardStats(BaseModel):
    total_quizzes: int
    average_marks: float
    highest_marks: float
    lowest_marks: float
    completed_quizzes: int
    incomplete_quizzes: int
    recent_attempts: list[QuizAttemptResponse]
