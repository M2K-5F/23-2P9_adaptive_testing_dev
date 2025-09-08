from typing import List, Type
from shemas import UserOut
from db import Course
from peewee import fn
from ..base.base_repository import BaseRepository

class CourseRepository(BaseRepository[Course]):
    def __init__(self):
        super().__init__(Course)

    
    def add_student(self, course: Course) -> Course:
        course.student_count += 1  # pyright: ignore
        course.save()
        return course
    
    def remove_student(self, course: Course) -> Course:
        course.student_count -= 1
        course.save()
        return course

    def search_courses_by_title(self, user: UserOut, title: str) -> List[Course]:
        searched_courses = Course.select().where(
            fn.lower(Course.title).contains(title.lower()),
            Course.created_by != user.username
        )

        return searched_courses
