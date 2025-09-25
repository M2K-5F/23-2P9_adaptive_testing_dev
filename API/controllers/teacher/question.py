from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from dependencies.user import get_user_from_request
from dependencies.dependencies import get_teacher_question_service, TQS
from shemas import UserOut, Roles, QuestionBase


question_router = APIRouter(prefix='/question', tags=['Teacher/Question'])


@question_router.post('/create', summary='Create question by topic')
def create_teacher_question(
    current_user = Depends(get_user_from_request),
    topic_id = Query(),
    question: QuestionBase = Body(),
    service: TQS = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.create_question(current_user, topic_id, question)


@question_router.get('/get', summary='Get created by teacher questions at topic')
def get_questions(
    current_user = Depends(get_user_from_request),
    topic_id = Query(),
    service: TQS = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.get_teacher_questions(current_user, topic_id)


@question_router.put('/arch')
def arch_question(
    current_user = Depends(get_user_from_request),
    question_id = Query(),
    service: TQS = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.arch_question(current_user, question_id)


@question_router.put('/unarch')
def unarch_question(
    current_user = Depends(get_user_from_request),
    question_id = Query(),
    service: TQS = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.unarch_question(current_user, question_id)


@question_router.post('/submit')
async def submit_text_questions(
    curent_user = Depends(get_user_from_request),
    user_answer_id = Query(),
    score: float = Query(),
    service: TQS = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.submit_text_question(curent_user, score, user_answer_id)