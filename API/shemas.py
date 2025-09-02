"""API templates"""
from enum import Enum
from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import List


class Roles(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"


class UserBase(BaseModel):
    username: str = Field("your_username", min_length=3, max_length=50)
    name: str = Field("your_name", min_length=2, max_length=100)
    telegram_link: str = "https://t.me/example"

    @field_validator('telegram_link')
    def validate_telegram_link(cls, v):
        if "t.me/" not in str(v):
            raise ValueError("Telegram link must contain 't.me/'")
        return v


class UserCreate(UserBase):
    password: str = "your_password"
    role: Roles


class UserOut(UserBase):
    roles: List[Roles]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AnswerOptionBase(BaseModel):
    text: str
    is_correct: bool = False


class QuestionBase(BaseModel):
    text: str = Field(..., min_length=3, max_length=500)
    question_type: str = "single_choice"
    answer_options: List[AnswerOptionBase]


class SubmitAnswerUnit(BaseModel):
    id: int
    is_correct: bool


class SubmitQuestionUnit(BaseModel):
    id: int
    answer_options: List[SubmitAnswerUnit]
    by_topic: int


class TopicSubmitAnswers(BaseModel):
    user_topic_id: int
    questions: List[
        SubmitQuestionUnit
    ]


class Course(BaseModel):
    title: str
    is_active: bool