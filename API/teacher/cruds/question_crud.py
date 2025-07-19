from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import (database, User, UserRole, Role, 
    Course, Answer, Question,
    Topic,
)
from shemas import UserCreate, Roles, UserOut, QuestionBase, AnswerOptionBase



@database.atomic()
def create_question(user: UserOut, topic_id: str, question: QuestionBase ):
    current_topic = Topic.get_or_none(
        Topic.id == topic_id
    )
    if not current_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="topic not found"
        )
    
    created_question, is_created = Question.get_or_create(
        text = question.text,
        by_topic = current_topic,
        defaults = {"question_type" : question.question_type}
    )

    if not is_created:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "question with that title already created in topic"
        )

    for answer_option in question.answer_options:
        Answer.create(
            text = answer_option.text,
            is_correct = answer_option.is_correct,
            by_question = created_question
        )
    
    return JSONResponse(
        content=created_question.__data__
    )


@database.atomic()
def arch_question(user: UserOut, question_id: str ):
    current_question = Question.get_or_none(
        Question.id == question_id
    )

    current_question.is_active = not current_question.is_active
    current_question.save()
    
    return JSONResponse(current_question.__data__)


@database.atomic()
def get_question_list(user: UserOut, topic_id: str):
    current_topic = Topic.get_or_none(
        Topic.id == topic_id,
        Topic.created_by == user.username
    )
    if not current_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="topic not found"
        )
    
    questions = Question.select().where(
        Question.by_topic == current_topic
    )
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found"
        )
    
    to_return = []
    for question in questions:
        db_answers = Answer.select().where(
            Answer.by_question == question
        )
        answers = []
        for answer in db_answers:
            answers.append(answer.__data__)

        to_return.append({**question.__data__, "answer_options": answers})

    return JSONResponse(
        content=to_return
    )