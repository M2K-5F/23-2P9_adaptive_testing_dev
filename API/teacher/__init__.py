from fastapi import Depends, APIRouter
from api_depends import is_teacher
from .views import question_router, topic_router, course_router


teacher_router = APIRouter(prefix='/t', dependencies=[Depends(is_teacher)])

teacher_router.include_router(question_router)
teacher_router.include_router(topic_router)
teacher_router.include_router(course_router)