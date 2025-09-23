from fastapi.responses import JSONResponse
from repositories.course.course_repository import CourseRepository
from repositories.group.group import GroupRepository
from models import database
from repositories.group.user_group import UserGroupRepository
from shemas import UserOut


class GroupService:
    def __init__(
        self,
        group: GroupRepository,
        course: CourseRepository,
        user_group: UserGroupRepository
    ):
        self._group = group
        self._user_group = user_group
        self._course = course


    @database.atomic()
    def get_group_list_by_course(
        self,
        user: UserOut,
        course_id: int
    ):
        current_course = self._course.get_by_id(course_id, True)
        groups = self._group.select_where(by_course = current_course)
        user_group = self._user_group.get_user_group_by_user(
            user, current_course
        )

        id = user_group.id if user_group else 0

        return JSONResponse([
            {
                **group.dump, 
                "user_group": {**user_group.dump} if id == group.id else False  #pyright: ignore
            }
            for group in groups
        ])
    

    @database.atomic()
    def follow_group(
        self,
        user: UserOut,
        group_id: int,
    ):
        current_group = self._group.get_by_id(group_id, True)
        user_group = self._user_group.get_or_create(
            True,
            user = user.username,
            group = current_group,
        )
        self._group.update(
            current_group,
            student_count = current_group.student_count + 1
        )
        return JSONResponse(user_group.dump)
    

    @database.atomic()
    def unfollow_group(
        self,
        user: UserOut,
        group_id: int
    ):
        current_group = self._group.get_by_id(group_id, True)

        user_group = self._user_group.get_or_none(
            True,
            user = user.username,
            group = current_group
        )
        self._group.update(
            current_group,
            student_count = current_group.student_count - 1
        )

        user_group.delete_instance()
        return JSONResponse(user_group.dump)