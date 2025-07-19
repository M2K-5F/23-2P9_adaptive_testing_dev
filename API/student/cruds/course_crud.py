from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import database, Course, UserCourse
from shemas import UserOut


@database.atomic()
def get_followed_courses(user: UserOut):
    followed_courses = UserCourse\
                        .select(UserCourse, Course)\
                        .join(Course, on=(UserCourse.course == Course.id))\
                        .where(UserCourse.user == user.username)

    return JSONResponse([{**uc.__data__, "course": uc.course.__data__} for uc in followed_courses])

@database.atomic()
def follow_course(user: UserOut, course_id: str, unfollow: bool = False):
    current_course: Course = Course.get_or_none(Course.id == course_id)
    if not current_course or not current_course.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    user_course, is_created = UserCourse.get_or_create(
        user = user.username,
        course = current_course,
    )

    if is_created and unfollow:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "course are not follow"
        )

    if not is_created and not unfollow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course already followed"
        )

    if not is_created and unfollow:
        user_course.delete_instance()

        return JSONResponse(
            {"deleted_user_course": user_course.__data__}
        )
    
    return JSONResponse(user_course.__data__)


@database.atomic()
def get_course_by_id(user: UserOut, courseId: int):
    current_course = Course.get_or_none(Course.id == courseId)
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    followed_course = UserCourse.get_or_none(UserCourse.user == user.username, UserCourse.course == current_course)

    return JSONResponse({'course_data': current_course.__data__, 'isFollowed': True if followed_course else False})