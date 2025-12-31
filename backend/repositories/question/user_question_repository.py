from operator import truediv
from typing import List, Type, Union
from models import Question, Topic, UserQuestion, UserTopic
from shemas import UserOut
from ..base.base_repository import BaseRepository

class UserQuestionRepository(BaseRepository[UserQuestion]):
    def __init__(self):
        super().__init__(UserQuestion)

    
    def get_or_create_user_question(self, username: str, by_user_topic: Union[UserTopic, int], question: Question):
        user_question, is_created = self.get_or_create(
            False, {},
            user = username,
            by_user_topic = by_user_topic,
            question = question,
            is_active = True
        )
        return user_question

    
    def get_by_user_topic(self, user_topic: UserTopic):
        user_questions = self.select_where(by_user_topic = user_topic, is_active = True)
        return user_questions
