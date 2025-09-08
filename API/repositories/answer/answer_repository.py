from typing import Type
from db import Answer
from ..base.base_repository import BaseRepository

class AnswerRepository(BaseRepository[Answer]):
    def __init__(self):
        super().__init__(Answer)