from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from db import database, User, Course

from shemas import UserOut



@database.atomic()
def course_create(course_title, user: UserOut):

    if Course.get_or_none(
        Course.title == course_title, 
        Course.created_by == User.get_or_none(
            User.username == user.username
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course already created"
        )
    try:
        data: Course = Course.create(
            title = course_title,
            created_by = user.username,
        )

    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some exc"
        )

    return JSONResponse(
        content={
            "title": data.title,
        }
    )


@database.atomic()
def change_activity_of_course(course_id: str, user: UserOut):
    current_course = Course.get_or_none(Course.id == course_id)
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    try:
        current_course.is_active = not current_course.is_active
        current_course.save()
        return current_course.__data__        
    
    except: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )

        
@database.atomic()
def get_created_by_teacher_courses(user: UserOut):
        courses = Course.select().where(Course.created_by == user.username)

        return JSONResponse([course.__data__ for course in courses])