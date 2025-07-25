from typing import List
from fastapi import HTTPException, status
from peewee import prefetch
from fastapi.responses import JSONResponse
from playhouse.shortcuts import model_to_dict

from db import (UserTopic, database, User, UserRole, Role,
    Course, Answer, Question,
    Topic, UserCourse, UserQuestion,
)
from shemas import SubmitAnswerUnit, SubmitQuestionUnit, TopicSubmitAnswers, UserCreate, Roles, UserOut, QuestionBase, AnswerOptionBase


@database.atomic()
def get_topics_by_course(user: UserOut, course_id: str):
    topics = Topic.select().where(Topic.by_course == course_id)

    to_return = []
    for topic in topics:
        count = len(topic.created_questions)
        to_return.append({**topic.__data__, "count": count})
    
    return JSONResponse(to_return)


@database.atomic()
def get_topics_by_followed_course(user: UserOut, user_course_id):
    
    user_course: UserCourse = UserCourse.get_or_none(UserCourse.id == user_course_id, UserCourse.user == user.username, UserCourse.is_active == True)
    
    if not user_course:
        raise HTTPException(400, 'you not followed at course')

    user_topics: list[UserTopic] = (UserTopic
                                    .select()
                                    .join(Topic)
                                    .where(UserTopic.by_user_course == user_course)
                                    .order_by(UserTopic.topic.number_in_course)
    )


    return JSONResponse([
        model_to_dict(topic, exclude=[UserTopic.user], max_depth=1) 
        for topic in user_topics
    ])


@database.atomic()
def follow_topic(user: UserOut, topic_id, unfollow: bool = False):
    try:
        current_topic: Topic = Topic.get_by_id(topic_id)
        if not current_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "topic inactive"
            )
    
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )


    if not UserCourse.select().where(
        UserCourse.user == user.username,
        UserCourse.course == current_topic.by_course
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="cant follow topic by unfollow course"
        )

    user_topic, is_created = UserTopic.get_or_create(
        user = user.username,
        topic = current_topic
    )

    if not is_created and unfollow:
        user_topic.delete_instance()

        return JSONResponse(
            content={
                "deleted_user_topic": user_topic.__data__
            }
        )

    if is_created and unfollow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="topic already unfollowed"
        )

    if not is_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="topic already followed"
        )
    
    return user_topic.__data__


def start_topic(user: UserOut, user_topic_id: str):
    user_topic: UserTopic = UserTopic.get_or_none(UserTopic.id == user_topic_id)

    if not user_topic:
        raise HTTPException(400, 'u not followed at this course')

    if not user_topic.by_user_course.is_active:
        raise HTTPException(400, 'This course are inactive')

    if not user_topic.ready_to_pass:
        raise HTTPException(400, 'u cannot pass this topic, please pass previous')

    current_topic = user_topic.topic

    questions = (Question
                .select()
                .where(Question.by_topic == current_topic.id, Question.is_active)
    )

    questions_with_answers = []
    
    for question in questions:
        answers = list(question.created_answers)
        questions_with_answers.append({
            **question.__data__, 'answer_options': [model_to_dict(answer, max_depth=1, exclude=[Answer.is_correct, Answer.by_question]) for answer in answers]
        })


    if not current_topic.number_in_course:    
        return JSONResponse(questions_with_answers)

    return JSONResponse('logic not included yet')


def submit_topic_answers(user: UserOut, topic_answers_data: TopicSubmitAnswers):
    user_topic = UserTopic.get_or_none(UserTopic.id == topic_answers_data.user_topic_id, UserTopic.user == user.username)

    if not user_topic:
        raise HTTPException(400, 'topic not found or u not followed at course')

    if not user_topic.ready_to_pass or user_topic.is_completed:
        raise HTTPException(400, 'u cannot pass this topic')

    score = 0

    submit_questions = topic_answers_data.questions
    submit_questions.sort(key= lambda que: que.id)

    created_questions = (Question
                        .select()
                        .where(Question.by_topic == user_topic.topic.id, Question.is_active)
                        .order_by(Question.id)
    )

    if len(submit_questions) != len(created_questions):
        raise HTTPException(400, 'u didn`t answer all questions')

    question_count = len(submit_questions)

    for index, submit_question in enumerate(submit_questions):
        created_question = created_questions[index]
        if submit_question.id != created_question.id:
            raise HTTPException(400 ,'question IDs is not matches')
        
        submit_answers = (submit_question.answer_options)
        submit_answers.sort(key=lambda ans: ans.id)
        created_answers = (Answer
                            .select()
                            .where(Answer.by_question == submit_question.id)
                            .order_by(Answer.id)
        )

        if len(submit_answers) != len(created_answers):
            raise HTTPException(400, 'u didn`t answer all answers')

        answer_count = len(submit_answers)
        question_score = 0

        for index, submit_answer in enumerate(submit_answers):
            created_answer: Answer = created_answers[index]
            if created_answer.id != submit_answer.id:
                raise HTTPException(400, 'answer IDs is not matches')

            if created_answer.is_correct == submit_answer.is_correct:
                score += 1 / (answer_count * question_count)
                question_score += 1 / answer_count

        uk, is_created = UserQuestion.get_or_create(
            user = user.username,
            by_user_topic = user_topic,
            question = created_question,
            defaults = {
                'question_score': question_score
            }
        )
        if not is_created:
            uk.question_score = question_score
            uk.save()

    user_topic.topic_progress = round(score, 3)
    user_topic.is_completed = True
    user_topic.ready_to_pass = False
    user_topic.save()

    ut = UserTopic.select().join(Topic).where(UserTopic.topic.number_in_course == user_topic.topic.number_in_course + 1, UserTopic.by_user_course == user_topic.by_user_course).first()
    print(ut)
    if ut:
        ut.ready_to_pass = True
        ut.save()
    
    else: 
        return JSONResponse({'score': round(score, 3), 'it the': 'last'})


    return JSONResponse({'score': round(score, 3)})