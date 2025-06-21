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
    telegram_link: str = "https:t.me//example.com/"

    @field_validator('telegram_link')
    def validate_telegram_link(cls, v):
        if "t.me/" not in str(v):
            raise ValueError("Telegram link must contain 't.me/'")
        return v


class UserCreate(UserBase):
    password: str = "your_password"
    role: Roles


class UserOut(UserBase):
    role: Roles


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AnswerOptionBase(BaseModel):
    text: str
    is_correct: bool = False


# class AnswerOptionOut(BaseModel):
#     id: int
#     text: str

#     class Config:
#         from_attributes = True


class QuestionBase(BaseModel):
    text: str = Field(..., min_length=3, max_length=500)
    question_type: str = "single_choice"
    answer_options: List[AnswerOptionBase]


# class PollBase(BaseModel):
#     title: str = Field(..., min_length=3, max_length=100, )
#     description: Optional[str] = Field(None, max_length=500)


# class PollCreate(PollBase):
#     questions: list[QuestionBase]


# class Poll(PollBase):
#     id: int
#     created_by_id: str
#     created_at: datetime
#     is_active: bool = True


# class PollAnswersSubmit(BaseModel):
#     answers: list[AnswerOptionCreate]


# class PollWithQuestions(BaseModel):
#     id: int
#     title: str
#     description: str
#     questions: list[Question]


# class UserAnswerBase(BaseModel):
#     answer_option_id: int


# class UserAnswerCreate(UserAnswerBase):
#     question_id: int


# class UserAnswer(UserAnswerBase):
#     id: int
#     user_id: int
#     question_id: int

class Course(BaseModel):
    title: str
    is_active: bool