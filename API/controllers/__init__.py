from .auth.user import auth_router
from .search.course import search_router
from .student.course import course_router as s_course_router
from .student.topic import topic_router as s_topic_router
from .teacher.course import course_router
from .teacher.question import question_router
from .teacher.topic import topic_router
from fastapi import FastAPI, APIRouter, Depends
from dependencies.user import is_student, is_teacher

teacher_router = APIRouter(prefix='/t', dependencies=[Depends(is_teacher)])

teacher_router.include_router(question_router)
teacher_router.include_router(topic_router)
teacher_router.include_router(course_router)

student_router = APIRouter(prefix='/s', dependencies=[Depends(is_student)])

student_router.include_router(s_course_router)
student_router.include_router(s_topic_router)


main_router = APIRouter(prefix='/api')
main_router.include_router(auth_router)
main_router.include_router(search_router)
main_router.include_router(student_router)
main_router.include_router(teacher_router)
