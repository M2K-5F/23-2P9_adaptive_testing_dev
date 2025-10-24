"""API templates"""
from ast import literal_eval
from enum import Enum
from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import List, Optional, Union, Literal


class Roles(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"


class UserBase(BaseModel):
    username: str = Field("your_username", min_length=3, max_length=50)
    name: str = Field("your_name", min_length=2, max_length=100)
    telegram_link: str = "https://t.me/example"

    @field_validator('telegram_link')
    def validate_telegram_link(cls, v):
        if "https://t.me/" not in str(v):
            raise ValueError("Telegram link must contain 't.me/'")
        return v


class UserCreate(UserBase):
    password: str = "your_password"
    role: Literal['student', 'teacher']


class UserOut(UserBase):
    roles: List[Roles]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AnswerOptionBase(BaseModel):
    text: str
    is_correct: bool = False


class QuestionBase(BaseModel):
    text: str 
    topic_id: int
    question_type: Literal['text', 'choice']
    answer_options: List[AnswerOptionBase]
    base_weight_profile: Literal['Aggressive', 'Balanced', 'Gentle']



class SubmitAnswerUnit(BaseModel):
    id: int
    is_correct: bool


class SubmitTextQuestionUnit(BaseModel):
    id: int
    text: str
    by_topic: int
    type: Literal['text'] = 'text'


class SubmitChoiceQuestionUnit(BaseModel):
    id: int
    answer_options: List[SubmitAnswerUnit]
    by_topic: int
    type: Literal['choice'] = 'choice'


SubmitQuestion = Union[SubmitChoiceQuestionUnit, SubmitTextQuestionUnit]


class TopicSubmitAnswers(BaseModel):
    user_topic_id: int
    topic_attempt_id: int
    questions: List[
        SubmitQuestion
    ]


class Course(BaseModel):
    title: str
    is_active: bool


class TopicToCreate(BaseModel):
    title: str
    description: str
    course_id: int
    score_for_pass: Literal['0.5', '0.6', '0.7', '0.8', '0.9', '0.95', '1.0' ]

    
class GroupToCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=3, max_length=128)
    max_student_count: Literal['5', '10', '15', '20', '25','30']
    profile: Literal['Aggressive', 'Balanced', 'Gentle']


class PublicGroupToCreate(GroupToCreate):
    type: Literal['public']

class PrivateGroupToCreate(GroupToCreate):
    type: Literal['private']
    passkey: str = Field(min_length=3, max_length=16)


GroupCreate = Union[PublicGroupToCreate, PrivateGroupToCreate]

class GroupFollowRequest(BaseModel):
    passkey: Optional[str] = Field(min_length=3, max_length=16)
    