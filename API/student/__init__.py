from fastapi import APIRouter, Depends
from api_depends import is_student
from .views import topic_router, course_router

student_router = APIRouter(
    prefix='/s',
    dependencies=[Depends(is_student)]
)

student_router.include_router(course_router)
student_router.include_router(topic_router)