from typing import Type
from models import AdaptiveQuestion, Question, UserQuestion, UserTopic
from shemas import UserOut
from ..base.base_repository import BaseRepository

class AdaptiveQuestionRepository(BaseRepository[AdaptiveQuestion]):
    def __init__(self):
        super().__init__(AdaptiveQuestion)

    
    def create_adaptive_question(self, user: UserOut, for_user_topic: UserTopic, question: UserQuestion) -> AdaptiveQuestion:
        adaptive_question, _ = self.get_or_create(False,
                user = user.username,
                for_user_topic = for_user_topic,
                by_user_topic = question.by_user_topic,
                question = question.question,
            )
        return adaptive_question

    def get_adaptive_question(self, question_id: int, user_topic: UserTopic) -> AdaptiveQuestion:
        adaptive_topic = self.get_or_none(True, question = question_id, for_user_topic = user_topic)
        return adaptive_topic