from typing import List, Type
from models import Course, QuestionWeight, Question, Topic, UserTopic
from ..base.base_repository import BaseRepository

class QuestionWeightRepository(BaseRepository[QuestionWeight]):
    def __init__(self):
        super().__init__(QuestionWeight)

    def get_previous_question_weights(self, user_topic: UserTopic):
        return list(self.model
                .select()
                .join(Question, on=(self.model.question == Question.id))
                .join(Topic, on=(Question.by_topic == Topic.id))
                .where(
                    Topic.number_in_course < user_topic.topic.number_in_course,
                    self.model.group == user_topic.by_user_group.group
                )
            )