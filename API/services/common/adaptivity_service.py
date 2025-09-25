import random
from typing import List
from fastapi.responses import JSONResponse
from models import Question, UserQuestion, UserTopic
from repositories import UserQuestionRepository, AdaptiveQuestionRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from services.common.progress_service import ProgressService
from shemas import SubmitQuestion, UserOut
from utils.score_utils import get_average_score


class AdaptivityServise:
    """Service for managing adaptive logic"""

    def __init__(
        self,
        user_question_repo: UserQuestionRepository,
        adaptive_question_repo: AdaptiveQuestionRepository,
        user_topic_repo: UserTopicRepository,
        progress_service: ProgressService
    ):
        self._adaptive_question_repo = adaptive_question_repo
        self._user_question_repo = user_question_repo
        self._user_topic_repo = user_topic_repo
        self._progress_service = progress_service


    # def add_adaptive_questions_to_list(
    #     self, 
    #     user: UserOut, 
    #     user_topic: UserTopic, 
    #     questions_list: List[dict]
    # ) -> List[dict]:
        
    #     """Returns list with injected adaptive questions to pass

    #     Args:
    #         user (UserOut): current user 
    #         user_topic (UserTopic): user topic for which adaptive questions need to be inject
    #         questions_list (List[dict]): list of questions where adaptive questions are injected

    #     Returns:
    #         List[dict]: List of questions and injected adaptive questions to pass
    #     """

    #     user_questions = self._user_question_repo.get_user_questions_with_low_score(user_topic)
    #     adaptive_questions: list[UserQuestion] = []

    #     for _ in range(min(2, len(user_questions))):
    #         question = random.choice(user_questions)
    #         user_questions.remove(question)
    #         adaptive_questions.append(question)
        

    #     for user_question in adaptive_questions:
    #         self._adaptive_question_repo.create_adaptive_question(
    #             user, user_topic, user_question
    #         )
    #         questions_list.insert(
    #             random.randint(0, len(questions_list)-1),
    #             {
    #                 **user_question.question.dump,
    #                 "answer_options": [{
    #                         "id": answer.id,
    #                         "text": "" if user_question.question.question_type == 'text' else answer.text
    #                     } for answer in user_question.question.created_answers]
    #             }
    #         )
        
    #     return questions_list
    

    # def save_adaptive_question_results(
    #     self, user: UserOut, user_topic: UserTopic,
    #     submit_question: SubmitQuestion
    # ) -> None:
        
    #     """Procedure which process saving result of adaptive question and delete it

    #     Args:
    #         user (UserOut): current user
    #         user_topic (UserTopic): topic for which the question was be added
    #         submit_question (SubmitQuestion): question data from client for get origin user topic for which question was added
    #     """

    #     user_topic_by_adaptive_question = self._user_topic_repo.get_or_none(True,
    #         user = user.username,
    #         topic = submit_question.by_topic
    #     )
        
    #     user_questions_by_user_topic = self._user_question_repo.get_by_user_topic(
    #         user_topic_by_adaptive_question
    #     )
        
    #     user_topic_score = get_average_score(
    #         user_questions_by_user_topic, 
    #         lambda q: q.progress
    #     )

    #     self._progress_service.update_user_topic_score(
    #         user_topic_by_adaptive_question,
    #         max(
    #             user_topic_score, 
    #             user_topic_by_adaptive_question.progress # pyright: ignore
    #         )
    #     )

    #     self._adaptive_question_repo.delete(True, 
    #         question = submit_question.id, 
    #         for_user_topic = user_topic
    #     )    


    # def get_adaptive_questions_to_list(
    #     self,
    #     user_topic: UserTopic,
    #     questions_list: List[SubmitQuestion],
    # ) -> List[Question]:
    #     """Method which get list of adaptive questions

    #     Args:
    #         user_topic (UserTopic): user topic 
    #         questions_list (List[Question]): list of created questions from database

    #     Returns:
    #         List[Question]: list of adaptive questions
    #     """
        
    #     submit_adaptive_questions: List[SubmitQuestion] = list(
    #         filter(lambda q: q.by_topic != user_topic.topic.id, questions_list)
    #     )
    #     to_return = []

    #     for q in submit_adaptive_questions:
    #         adaptive_question = self._adaptive_question_repo.get_adaptive_question(q.id, user_topic)
    #         current_question: Question = adaptive_question.question # pyright: ignore
    #         to_return.append(current_question)
        
    #     return to_return