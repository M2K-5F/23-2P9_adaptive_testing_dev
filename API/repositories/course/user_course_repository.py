from typing import Type, List
from models import Course, UserCourse, database, Topic
from ..base.base_repository import BaseRepository
from shemas import UserOut

class UserCourseRepository(BaseRepository[UserCourse]):
    def __init__(self):
        super().__init__(UserCourse)


    def get_active_user_courses_from_user(self, user: UserOut) -> List[UserCourse]:
        followed_courses = list(UserCourse
            .select()
            .where(
                UserCourse.user == user.username,
                UserCourse.is_active
            )
        )
        return followed_courses

    def activate_user_course(self, instance: UserCourse) -> UserCourse: 
        setattr(instance, 'is_active', True)
        instance.save()
        return instance

    def get_active_user_course_from_user(self, user: UserOut, course: Course) -> UserCourse:
        user_course = self.get_or_none(True, user=user.username, course=course, is_active=True)
        return user_course
    
    def clear_user_course_progress(self, user_course: UserCourse) -> UserCourse:
        user_course.course_progress = 0
        user_course.completed_topic_number = 0
        user_course.save()
        return user_course

    def get_active_user_course_from_user_and_id(self, user: UserOut, user_course_id: int) -> UserCourse:
        user_course = self.get_or_none(True, id = user_course_id, user = user.username, is_active = True)
        return user_course
    

    def get_user_courses_by_course(self, course: Course):
        return self.select_where(course = course)


    def update_user_courses_progress(self, course: Course) -> int:
        user_courses = self.select_where(course = course)
        counter = 0
        for user_course in user_courses:
            self.update_by_instance(
                user_course, 
                {
                    'course_progress': user_course.completed_topic_number / user_course.course.topic_count * 100
                }
            )
            counter += 1

        return counter