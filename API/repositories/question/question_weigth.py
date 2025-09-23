from typing import List, Type
from models import Course, QuestionWeigth, Question, Topic
from ..base.base_repository import BaseRepository

class QuestionWeigthRepository(BaseRepository[QuestionWeigth]):
    def __init__(self):
        super().__init__(QuestionWeigth)