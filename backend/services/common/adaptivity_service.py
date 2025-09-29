from datetime import datetime
import random
from typing import List, Tuple
from fastapi.responses import JSONResponse
from config import weight_config
from config.adaptivity_config import ADAPTIVE_QUESTIONS_COUNT_PERCENTAGE, LAST_SCORE, LAST_TIME, QUESTION_WEIGHT, TIME_NORMALIZE_DAYS
from models import Question, QuestionWeight, Topic, User, UserQuestion, UserTopic
from repositories import UserQuestionRepository
from repositories.question.question_weight import QuestionWeightRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from services.common.progress_service import ProgressService
from shemas import SubmitQuestion, UserOut
from utils.score_utils import get_average_score


class AdaptivityServise:
    """Service for managing adaptive logic"""

    def __init__(
        self,
        user_question_repo: UserQuestionRepository,
        question_weight: QuestionWeightRepository
    ):
        self._user_question_repo = user_question_repo
        self._question_weight = question_weight


    def get_question_factor(self, user_topic: UserTopic, question: Question, score: float):
        question_weight = self._question_weight.get_or_none(
            True,
            question = question,
            group = user_topic.by_user_group.group
        )

        weight: float = question_weight.weight  # pyright: ignore[reportAssignmentType]
        self.update_question_weight(question_weight, score)
        
        return max(weight / weight_config.BASE_WEIGHT, user_topic.topic.score_for_pass)


    def update_question_weight(self, question_weight: QuestionWeight, score: float):
        weight: float = question_weight.weight  # pyright: ignore[reportAssignmentType]
        step: float = question_weight.step  # pyright: ignore[reportAssignmentType]
        max_w: float = question_weight.max_weight  # pyright: ignore[reportAssignmentType]
        min_w: float = question_weight.min_weight  # pyright: ignore[reportAssignmentType]
        score_step = (((score - 0.5) * 2 ) * step)
        updated_weight = weight - float(round(score_step, 4))

        self._question_weight.update(
            question_weight, 
            weight = min(max(min_w, updated_weight), max_w)
        )


    def calculate_adaptive_question_weight(self, question_weight: QuestionWeight, user: User):
        weight: float = (question_weight.weight) / weight_config.BASE_WEIGHT # pyright: ignore[reportAssignmentType]
        last_question = (self._user_question_repo.get_or_none(
            True,
            is_active = True,
            question = question_weight.question,
            user = user
        ))
        last_progress: float = last_question.progress  # pyright: ignore[reportAssignmentType]
        answer_time: datetime = last_question.created_at  # pyright: ignore[reportAssignmentType]
        last_time = datetime.now() - answer_time
        normalized_time = (last_time.days / TIME_NORMALIZE_DAYS)
        value = (
            weight * QUESTION_WEIGHT + 
            (1- last_progress) * LAST_SCORE + 
            normalized_time * LAST_TIME
        )

        return value

    
    def get_adaptive_questions(self, user_topic: UserTopic, questions_count: int):
        question_weights: List[QuestionWeight] = self._question_weight.get_previous_question_weights(user_topic)

        question_pool: List[Tuple[float, Question]] = []

        for question_weight in question_weights:
            value = self.calculate_adaptive_question_weight(
                question_weight, 
                user_topic.user  # pyright: ignore
            )
            question_pool.append((value, question_weight.question))  # pyright: ignore

        question_pool.sort(key=lambda q: q[0], reverse=True)

        return [q[1] for q in question_pool[:int(ADAPTIVE_QUESTIONS_COUNT_PERCENTAGE / 100 * questions_count)]]