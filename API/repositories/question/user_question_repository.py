from typing import List, Type
from db import Question, Topic, UserQuestion, UserTopic
from shemas import UserOut
from ..base.base_repository import BaseRepository

class UserQuestionRepository(BaseRepository[UserQuestion]):
    def __init__(self):
        super().__init__(UserQuestion)

    
    def get_user_questions_with_low_score(self, user_topic: UserTopic) -> List[UserQuestion]:
        user_questions = list(UserQuestion
                            .select()
                            .join(UserTopic, on=(UserQuestion.by_user_topic == UserTopic.id))
                            .join(Topic, on=(UserTopic.topic == Topic.id))
                            .where(
                                Topic.by_course == user_topic.by_user_course.course,
                                Topic.number_in_course < user_topic.topic.number_in_course,
                                UserQuestion.question_score.between(0, 0.5)
                            )
        )
        return user_questions
    
    def create_user_question(self, user: UserOut, by_user_topic: UserTopic, question: Question):
        user_question, is_created = self.get_or_create(
            False, {},
            user = user.username,
            by_user_topic = by_user_topic,
            question = question
        )
        return user_question

    
    def get_by_user_topic(self, user_topic: UserTopic):
        user_questions = self.select_where(by_user_topic = user_topic)
        return user_questions
