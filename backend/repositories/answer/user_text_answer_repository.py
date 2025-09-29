from typing import List, Type, Union
from shemas import UserOut
from models import Question, UserQuestion, UserTextAnswer, UserTopic
from ..base.base_repository import BaseRepository

class UserTextAnswerRepository(BaseRepository[UserTextAnswer]):
    def __init__(self):
        super().__init__(UserTextAnswer)

    def create_user_text_answer(
        self,
        user: UserOut,
        question: Question,
        by_user_topic: Union[UserTopic, int],
        for_user_question: UserQuestion,
        answer_text: str
    ):
        user_answer, is_create = self.get_or_create(
            False, {"text": answer_text},
            user = user.username,
            question = question,
            by_user_topic = by_user_topic,
            for_user_question =for_user_question
        )
        if not is_create:
            user_answer = self.update(
                user_answer,
                text = answer_text
            )
        return user_answer

    def get_unsubmited_answers_by_user_topic(self, user_topic: UserTopic) -> List[UserTextAnswer]:
        unsubmited_answers = (UserTextAnswer
                .select()
                .where(
                    UserTextAnswer.by_user_topic == user_topic,
                    UserTextAnswer.progress == 0,
                    UserTextAnswer.is_active
                )
        )
        return unsubmited_answers