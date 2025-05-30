"""API templates"""
from enum import Enum
from typing import Annotated
from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import Optional
from datetime import datetime


class Role(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"


class UserBase(BaseModel):
    username: str = Field("your_username", min_length=3, max_length=50)
    name: str = Field("your_name", min_length=2, max_length=100)
    telegram_link: HttpUrl= "https:t.me//example.com/"
    role: Role = "student"

    @field_validator('telegram_link')
    def validate_telegram_link(cls, v):
        if "t.me/" not in str(v):
            raise ValueError("Telegram link must contain 't.me/'")
        return v


class UserCreate(UserBase):
    password: str = "your_password"


class UserOut(UserBase):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AnswerOptionBase(BaseModel):
    text: str
    is_correct: bool = False


class AnswerOptionCreate(BaseModel):
    selected_option_ids: list[int]
    question_id: int

    # class Config:
    #     from_attributes = True


class AnswerOptionOut(BaseModel):
    id: int
    text: str

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    text: str = Field(..., min_length=3, max_length=500)
    question_type: str = "single_choice"
    answer_options: list[AnswerOptionBase]


class QuestionCreate(QuestionBase):
    poll_id: int


class Question(QuestionBase):
    id: int
    answer_options: list[AnswerOptionOut]

    class Config:
        from_attributes = True


class PollBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100, )
    description: Optional[str] = Field(None, max_length=500)


class PollCreate(PollBase):
    questions: list[QuestionBase]


class Poll(PollBase):
    id: int
    created_by_id: str
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class PollAnswersSubmit(BaseModel):
    answers: list[AnswerOptionCreate]


class PollWithQuestions(BaseModel):
    id: int
    title: str
    description: str
    questions: list[Question]

    # class Config:
    #     from_attributes = True


class UserAnswerBase(BaseModel):
    answer_option_id: int


class UserAnswerCreate(UserAnswerBase):
    question_id: int


class UserAnswer(UserAnswerBase):
    id: int
    user_id: int
    question_id: int
    answered_at: datetime

    class Config:
        from_attributes = True


if __name__ == "__main__":
    user1 = UserCreate(name="Alice", password="123").model_dump()["name"]

    print(user1)
