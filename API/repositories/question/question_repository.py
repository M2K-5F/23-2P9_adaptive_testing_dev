from typing import List, Type
from db import Question, Topic
from ..base.base_repository import BaseRepository

class QuestionRepository(BaseRepository[Question]):
    def __init__(self):
        super().__init__(Question)

    
    def get_active_questions_by_topic(self, topic: Topic) -> List[Question]:
        quetions = self.select_where(by_topic = topic.id, is_active = True)
        return quetions