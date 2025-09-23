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
