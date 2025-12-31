from fastapi import APIRouter, Depends, HTTPException, Path, status, Query, Body
from fastapi.responses import JSONResponse

from dependencies.user import get_user_from_request
from dependencies.dependencies import get_teacher_question_service
from shemas import UserOut, Roles, QuestionBase
from services.teacher.question_service import QuestionService


question_router = APIRouter(prefix='/question', tags=['Teacher/Question'])


@question_router.post('/create', summary='Create question by topic')
async def create_teacher_question(
    current_user = Depends(get_user_from_request),
    data: QuestionBase = Body(),
    service: QuestionService = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.create_question(current_user, data)


@question_router.get('/{topic_id}/get', summary='Get created by teacher questions at topic')
async def get_questions(
    current_user = Depends(get_user_from_request),
    topic_id = Path(),
    service: QuestionService = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.get_teacher_questions(current_user, topic_id)


@question_router.put('/{question_id}/arch')
async def arch_question(
    current_user = Depends(get_user_from_request),
    question_id = Path(),
    service: QuestionService = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.arch_question(current_user, question_id)


@question_router.put('/{question_id}/unarch')
async def unarch_question(
    current_user = Depends(get_user_from_request),
    question_id = Path(),
    service: QuestionService = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.unarch_question(current_user, question_id)


@question_router.post('/{user_answer_id}/submit')
async def submit_text_questions(
    curent_user = Depends(get_user_from_request),
    user_answer_id = Path(),
    score: float = Query(),
    service: QuestionService = Depends(get_teacher_question_service)
) -> JSONResponse:
    return service.submit_text_question(curent_user, score, user_answer_id)