from typing import List, Type
from shemas import UserOut
from models import Course, Group
from peewee import fn
from ..base.base_repository import BaseRepository

class GroupRepository(BaseRepository[Group]):
    def __init__(self):
        super().__init__(Group)

    
