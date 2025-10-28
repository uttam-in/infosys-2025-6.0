from database import get_db
from models.quiz import QuizAttemptCreate, QuizAttemptResponse, QuizAttemptUpdate, DashboardStats
from fastapi import HTTPException
from typing import List, Optional

class QuizController:
    def save_quiz_attempt(self, user_id: int, quiz_data: QuizAttemptCreate) -> QuizAttemptResponse:
        with get_db() as conn:
            cursor = conn.cursor()
            
            completed_at = "CURRENT_TIMESTAMP" if quiz_data.status == "completed" else "NULL"
            
            cursor.execute(f"""
                INSERT INTO quiz_attempts (user_id, topic, total_questions, score, percentage, status, quiz_data, user_answers, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, {completed_at})
            """, (user_id, quiz_data.topic, quiz_data.total_questions, quiz_data.score, 
                  quiz_data.percentage, quiz_data.status, quiz_data.quiz_data, quiz_data.user_answers))
            
            conn.commit()
            quiz_id = cursor.lastrowid
            
            cursor.execute("SELECT * FROM quiz_attempts WHERE id = ?", (quiz_id,))
            row = cursor.fetchone()
            
            return QuizAttemptResponse(
                id=row['id'],
                user_id=row['user_id'],
                topic=row['topic'],
                total_questions=row['total_questions'],
                score=row['score'],
                percentage=row['percentage'],
                status=row['status'],
                quiz_data=row['quiz_data'],
                user_answers=row['user_answers'],
                created_at=row['created_at'],
                completed_at=row['completed_at']
            )
    
    def update_quiz_attempt(self, quiz_id: int, user_id: int, update_data: QuizAttemptUpdate) -> QuizAttemptResponse:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Verify ownership
            cursor.execute("SELECT user_id FROM quiz_attempts WHERE id = ?", (quiz_id,))
            row = cursor.fetchone()
            if not row or row['user_id'] != user_id:
                raise HTTPException(status_code=404, detail="Quiz attempt not found")
            
            # Build update query dynamically
            updates = []
            params = []
            
            if update_data.score is not None:
                updates.append("score = ?")
                params.append(update_data.score)
            
            if update_data.percentage is not None:
                updates.append("percentage = ?")
                params.append(update_data.percentage)
            
            if update_data.status is not None:
                updates.append("status = ?")
                params.append(update_data.status)
                if update_data.status == "completed":
                    updates.append("completed_at = CURRENT_TIMESTAMP")
            
            if update_data.user_answers is not None:
                updates.append("user_answers = ?")
                params.append(update_data.user_answers)
            
            if not updates:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            params.append(quiz_id)
            query = f"UPDATE quiz_attempts SET {', '.join(updates)} WHERE id = ?"
            
            cursor.execute(query, params)
            conn.commit()
            
            cursor.execute("SELECT * FROM quiz_attempts WHERE id = ?", (quiz_id,))
            row = cursor.fetchone()
            
            return QuizAttemptResponse(
                id=row['id'],
                user_id=row['user_id'],
                topic=row['topic'],
                total_questions=row['total_questions'],
                score=row['score'],
                percentage=row['percentage'],
                status=row['status'],
                quiz_data=row['quiz_data'],
                user_answers=row['user_answers'],
                created_at=row['created_at'],
                completed_at=row['completed_at']
            )
    
    def get_quiz_attempt(self, quiz_id: int, user_id: int) -> Optional[QuizAttemptResponse]:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?", (quiz_id, user_id))
            row = cursor.fetchone()
            
            if not row:
                return None
            
            return QuizAttemptResponse(
                id=row['id'],
                user_id=row['user_id'],
                topic=row['topic'],
                total_questions=row['total_questions'],
                score=row['score'],
                percentage=row['percentage'],
                status=row['status'],
                quiz_data=row['quiz_data'],
                user_answers=row['user_answers'],
                created_at=row['created_at'],
                completed_at=row['completed_at']
            )
    
    def get_dashboard_stats(self, user_id: int) -> DashboardStats:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get total quizzes
            cursor.execute("SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?", (user_id,))
            total_quizzes = cursor.fetchone()['count']
            
            # Get completed and incomplete counts
            cursor.execute("SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND status = 'completed'", (user_id,))
            completed_quizzes = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND status = 'incomplete'", (user_id,))
            incomplete_quizzes = cursor.fetchone()['count']
            
            # Get stats (only from completed quizzes)
            cursor.execute("""
                SELECT 
                    AVG(percentage) as avg_marks,
                    MAX(percentage) as highest_marks,
                    MIN(percentage) as lowest_marks
                FROM quiz_attempts 
                WHERE user_id = ? AND status = 'completed'
            """, (user_id,))
            
            stats = cursor.fetchone()
            
            # Get recent 10 attempts
            cursor.execute("""
                SELECT * FROM quiz_attempts 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            """, (user_id,))
            
            recent_rows = cursor.fetchall()
            recent_attempts = [
                QuizAttemptResponse(
                    id=row['id'],
                    user_id=row['user_id'],
                    topic=row['topic'],
                    total_questions=row['total_questions'],
                    score=row['score'],
                    percentage=row['percentage'],
                    status=row['status'],
                    quiz_data=row['quiz_data'] if 'quiz_data' in row.keys() else None,
                    user_answers=row['user_answers'] if 'user_answers' in row.keys() else None,
                    created_at=row['created_at'],
                    completed_at=row['completed_at']
                )
                for row in recent_rows
            ]
            
            return DashboardStats(
                total_quizzes=total_quizzes,
                average_marks=round(stats['avg_marks'] or 0, 2),
                highest_marks=round(stats['highest_marks'] or 0, 2),
                lowest_marks=round(stats['lowest_marks'] or 0, 2) if stats['lowest_marks'] else 0,
                completed_quizzes=completed_quizzes,
                incomplete_quizzes=incomplete_quizzes,
                recent_attempts=recent_attempts
            )
    
    def get_user_quiz_attempts(self, user_id: int) -> List[QuizAttemptResponse]:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT * FROM quiz_attempts 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            """, (user_id,))
            
            rows = cursor.fetchall()
            
            return [
                QuizAttemptResponse(
                    id=row['id'],
                    user_id=row['user_id'],
                    topic=row['topic'],
                    total_questions=row['total_questions'],
                    score=row['score'],
                    percentage=row['percentage'],
                    status=row['status'],
                    quiz_data=row['quiz_data'],
                    user_answers=row['user_answers'],
                    created_at=row['created_at'],
                    completed_at=row['completed_at']
                )
                for row in rows
            ]
