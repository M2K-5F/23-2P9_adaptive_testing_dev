from typing import List, Optional, Type
from shemas import UserOut
from models import Course, Group, UserGroup
from peewee import fn
from ..base.base_repository import BaseRepository

class UserGroupRepository(BaseRepository[UserGroup]):
    def __init__(self):
        super().__init__(UserGroup)

    def get_user_group_by_user(self, user: UserOut, course: Course) -> Optional[UserGroup]:
        user_group = self.model.get_or_none(
            self.model.user == user.username,
            self.model.group == Group.get_or_none(Group.by_course == course)
        )

        return user_group


    def update_user_groups_progress(self, course: Course) -> int:
        user_groups = self.select_where(course = course)
        counter = 0
        for user_group in user_groups:
            self.update(
                user_group, 
                progress = user_group.completed_topic_count / user_group.course.topic_count
            )
            counter += 1

        return counter
    

    def clear_user_group_progress(self, user_group: UserGroup) -> UserGroup:
        user_group = self.update(
            user_group,
            progress = 0,
            completed_topic_count = 0
        )
        return user_group