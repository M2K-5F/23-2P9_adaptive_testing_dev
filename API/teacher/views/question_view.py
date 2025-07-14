from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request
from ..cruds import get_question_list, arch_question, create_question
from shemas import UserOut, Roles, QuestionBase


question_router = APIRouter(prefix='/question', tags=['Teacher/Question'])


@question_router.post('/create')
def create_teacher_question(
    current_user = Depends(get_user_from_request),
    topic_id = Query(),
    question: QuestionBase = Body()
) -> JSONResponse:
    return create_question(current_user, topic_id, question)


@question_router.get('/get')
def get_questions(
    current_user = Depends(get_user_from_request),
    topic_id = Query(),
) -> JSONResponse:
    return get_question_list(current_user, topic_id)


@question_router.put('/arch')
def arch_teacher_question(
    current_user = Depends(get_user_from_request),
    question_id = Query(),
) -> JSONResponse:
    return arch_question(current_user, question_id)