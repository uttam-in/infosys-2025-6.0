import os
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()


class Question(BaseModel):
    """Pydantic model for a single quiz question"""
    question: str = Field(description="The quiz question text")
    options: List[str] = Field(description="List of exactly 4 answer options")
    answer: str = Field(description="The correct answer from the options")


class QuizQuestions(BaseModel):
    """Pydantic model for a collection of quiz questions"""
    questions: List[Question] = Field(
        description="List of generated quiz questions")


class GeminiClient:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GOOGLE_API_KEY not found in environment variables")

        # Initialize ChatGoogleGenerativeAI with structured output
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=self.api_key,
            temperature=0.7
        )

        # Create structured output LLM
        self.structured_llm = self.llm.with_structured_output(QuizQuestions)

    def generate_questions(self, topic: str, number_questions: int) -> List[dict]:
        """
        Generate questions using Gemini LLM with structured output

        Args:
            topic (str): The topic for question generation
            number_questions (int): Number of questions to generate

        Returns:
            List[dict]: List of generated questions with options and answers
        """

        prompt = f"""
        Generate {number_questions} multiple choice questions about the topic: "{topic}".
        
        Requirements:
        1. Each question should have exactly 4 options
        2. Only one option should be correct
        3. Questions should be educational and appropriate
        4. The answer field should contain the exact text of the correct option
        
        Generate exactly {number_questions} questions.
        """

        try:
            # Invoke the structured LLM
            result: QuizQuestions = self.structured_llm.invoke(prompt)

            # Convert Pydantic models to dictionaries
            return [question.model_dump() for question in result.questions]

        except Exception as e:
            raise Exception(f"Error generating questions: {str(e)}")
