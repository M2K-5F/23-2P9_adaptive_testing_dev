from datetime import datetime
from typing import List, Tuple
from config.adaptivity_config import TIME_NORMALIZE_DAYS
from models import AdaptivityProfile, Question, QuestionWeight, User, UserTopic
from repositories import UserQuestionRepository
from repositories.question.question_weight import QuestionWeightRepository


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
        weight_profile = question_weight.profile

        return max( weight / weight_profile.base_weight, user_topic.topic.score_for_pass)


    def update_question_weight(self, question_weight: QuestionWeight, score: float):
        weight_profile = question_weight.profile

        score_step: float = (((score - weight_profile.score_bias) * 2 ) * weight_profile.base_step)  # pyright: ignore[reportAssignmentType]
        updated_weight: float = question_weight.weight - float(round(score_step, 4))

        self._question_weight.update(
            question_weight, 
            weight = min(max(weight_profile.min_weight, updated_weight), weight_profile.max_weight)
        )


    def calculate_adaptive_question_weight(self, question_weight: QuestionWeight, user: User):
        weight_profile = question_weight.profile
        adaptive_profile: AdaptivityProfile = question_weight.group.profile

        weight: float = (question_weight.weight) / weight_profile.base_weight # pyright: ignore[reportAssignmentType]
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
            weight * adaptive_profile.question_weight + 
            (1- last_progress) * adaptive_profile.last_score + 
            normalized_time * adaptive_profile.time_since_last
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

        adaptivity_profile: AdaptivityProfile = user_topic.by_user_group.group.profile

        return [question_pool[i][1] for i in range(min(int(adaptivity_profile.max_adaptive_questions_ratio * questions_count), adaptivity_profile.max_adaptive_questions_count))]  # pyright: ignore