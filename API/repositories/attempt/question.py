from typing import List, Type
from models import QuestionAttempt, TopicAttempt
from ..base.base_repository import BaseRepository

class QuestionAttemptRepository(BaseRepository[QuestionAttempt]):
    def __init__(self):
        super().__init__(QuestionAttempt)