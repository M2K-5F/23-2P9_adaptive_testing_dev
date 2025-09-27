from functools import lru_cache
from fastapi import Depends, dependencies
from repositories.attempt.question import QuestionAttemptRepository
from repositories.attempt.topic import TopicAttemptRepository
from repositories.group.group import GroupRepository
from repositories.group.user_group import UserGroupRepository
from repositories.question.question_weight import QuestionWeightRepository
from services import (
    US, SCS, STS, TCS, TQS, TTS, PS, AS
)
from repositories import (
    UserRepository, CourseRepository,
    TopicRepository, UserTopicRepository, UserQuestionRepository,
    UserTextAnswerRepository,
    AnswerRepository, QuestionRepository
)
from services.teacher.group import GroupService as TGS
from services.student.group import GroupService as SGS


@lru_cache(maxsize=None)
def get_user_repository() -> UserRepository:
    return UserRepository()


@lru_cache(maxsize=None)
def get_course_repository() -> CourseRepository:
    return CourseRepository()


@lru_cache(maxsize=None)
def get_topic_repository() -> TopicRepository:
    return TopicRepository()


@lru_cache(maxsize=None)
def get_question_repository() -> QuestionRepository:
    return QuestionRepository()


@lru_cache(maxsize=None)
def get_answer_repository() -> AnswerRepository:
    return AnswerRepository()

@lru_cache(maxsize=None)
def get_user_topic_repository() -> UserTopicRepository:
    return UserTopicRepository()


@lru_cache(maxsize=None)
def get_user_question_repository() -> UserQuestionRepository:
    return UserQuestionRepository()


@lru_cache(maxsize=None)
def get_user_text_answer_repository() -> UserTextAnswerRepository:
    return UserTextAnswerRepository()


@lru_cache(maxsize=None)
def get_user_group_repository():
    return UserGroupRepository()


@lru_cache(maxsize=None)
def get_question_weight_repository():
    return QuestionWeightRepository()


@lru_cache(maxsize=None)
def get_topic_attempt_repository():
    return TopicAttemptRepository()


@lru_cache(maxsize=None)
def get_question_attempt_repository():
    return QuestionAttemptRepository()


@lru_cache(maxsize=None)
def get_group_repo():
    return GroupRepository()


def get_progress_service(
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    text_answer_repo = Depends(get_user_text_answer_repository),
    user_group = Depends(get_user_group_repository),
    topic = Depends(get_topic_repository)
):
    return PS(
        topic,
        user_group,
        user_topic_repo,
        user_question_repo,
        text_answer_repo,
    )


def get_adaptivity_service(
    user_question_repo = Depends(get_user_question_repository),
    question_weight = Depends(get_question_weight_repository)
):
    return AS(
        user_question_repo,
        question_weight
    )


def get_user_service(
    user_repo = Depends(get_user_repository)
) -> US:
    return US(
        user_repo
    )

def get_student_course_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    progress_service = Depends(get_progress_service),
    user_group = Depends(get_user_group_repository)
) -> SCS:
    return SCS(
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
        progress_service
    )


def get_student_topic_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    question_repo = Depends(get_question_repository),
    progress_service = Depends(get_progress_service),
    adaptivity_service = Depends(get_adaptivity_service),
    user_group = Depends(get_user_group_repository),
    topic_attempt = Depends(get_topic_attempt_repository),
    question_attempt = Depends(get_question_attempt_repository)
):
    return STS(
        course_repo,
        topic_repo,
        user_topic_repo,
        question_repo,
        progress_service,
        adaptivity_service,
        user_group,
        topic_attempt, 
        question_attempt
    )


def get_techer_topic_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_group = Depends(get_user_group_repository)
):
    return TTS(
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
    )


def get_techer_course_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    user_group = Depends(get_user_group_repository),
    group = Depends(get_group_repo)
):
    return TCS(
        group,
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
        user_text_answer_repo,
    )


def get_teacher_question_service(
    topic_repo = Depends(get_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    answer_repo = Depends(get_answer_repository),
    question_repo = Depends(get_question_repository),
    progress_service = Depends(get_progress_service),
    question_weight = Depends(get_question_weight_repository),
    group = Depends(get_group_repo)
):
    return TQS(
        topic_repo, 
        question_weight,
        user_question_repo,
        user_text_answer_repo,
        answer_repo, 
        question_repo,
        progress_service,
        group
    )


def get_teacher_group_service(
    group = Depends(get_group_repo),
    course = Depends(get_course_repository),
    question = Depends(get_question_repository),
    question_weight = Depends(get_question_weight_repository)
):
    return TGS(
        group,
        course,
        question,
        question_weight
    )


def get_student_group_service(
    group = Depends(get_group_repo),
    course = Depends(get_course_repository),
    user_group = Depends(get_user_group_repository),
    topic = Depends(get_topic_repository),
    user_topic = Depends(get_user_topic_repository),
    progress_service = Depends(get_progress_service),
):
    return SGS(
        group, 
        course,
        user_group,
        topic,
        user_topic,
        progress_service
    )