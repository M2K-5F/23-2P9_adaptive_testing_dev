from typing import List, Type
from models import TopicAttempt
from ..base.base_repository import BaseRepository

class TopicAttemptRepository(BaseRepository[TopicAttempt]):
    def __init__(self):
        super().__init__(TopicAttempt)