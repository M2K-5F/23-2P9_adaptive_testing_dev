from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from .depends import get_current_active_user
from crud import compare_role,get_question_list, arch_question, create_question
from shemas import UserOut, Roles, QuestionBase

question_router = APIRouter(prefix='/question', tags=["Questions"])


@question_router.post('/create')
def create_teacher_question(
    current_user = Depends(get_current_active_user),
    topic_id = Query(),
    question: QuestionBase = Body()
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return create_question(current_user, topic_id, question)


@question_router.get('/get')
def get_questions(
    current_user = Depends(get_current_active_user),
    topic_id = Query(),
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return get_question_list(current_user, topic_id)


@question_router.put('/arch')
def arch_teacher_question(
    current_user = Depends(get_current_active_user),
    question_id = Query(),
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return arch_question(current_user, question_id)