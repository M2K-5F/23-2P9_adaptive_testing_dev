from typing import List, Type
from models import Course, QuestionWeight, Question, Topic
from ..base.base_repository import BaseRepository

class QuestionWeightRepository(BaseRepository[QuestionWeight]):
    def __init__(self):
        super().__init__(QuestionWeight)