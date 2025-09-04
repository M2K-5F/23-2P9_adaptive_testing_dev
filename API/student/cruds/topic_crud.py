from typing import List, Optional, Union
from fastapi import HTTPException, status
from peewee import prefetch
import random
from fastapi.responses import JSONResponse
from playhouse.shortcuts import model_to_dict

from db import (
    UserTopic, database, User, UserRole, Role,
    Course, Answer, Question, AdaptiveQuestion,
    Topic, UserCourse, UserQuestion, UserTextAnswer
)
from shemas import(
    SubmitAnswerUnit,
    SubmitChoiceQuestionUnit,
    SubmitTextQuestionUnit, 
    TopicSubmitAnswers, UserCreate, Roles, 
    UserOut, QuestionBase, AnswerOptionBase
)


@database.atomic()
def get_topics_by_course(user: UserOut, course_id: str):
    topics = (Topic
                .select()
                .where(Topic.by_course == course_id)
    )

    to_return = []
    for topic in topics:
        count = len(topic.created_questions)
        to_return.append({**topic.__data__, "count": count})
    
    return JSONResponse(to_return)


@database.atomic()
def get_topics_by_followed_course(user: UserOut, user_course_id):
    
    user_course: UserCourse = UserCourse.get_or_none(
        UserCourse.id == user_course_id, 
        UserCourse.user == user.username, 
        UserCourse.is_active
    )
    
    if not user_course:
        raise HTTPException(400, 'you not followed at course')

    user_topics = (UserTopic
                                    .select()
                                    .join(Topic)
                                    .where(UserTopic.by_user_course == user_course)
                                    .order_by(UserTopic.topic.number_in_course.asc())
    )

    for user_topic in user_topics:
        if not user_topic.topic.is_active:
            user_topic.ready_to_pass = False

    return JSONResponse([topic.dump for topic in user_topics])


def start_topic(user: UserOut, user_topic_id: str):
    user_topic: UserTopic = UserTopic.get_or_none(UserTopic.id == user_topic_id, UserTopic.user == user.username)

    if not user_topic:
        raise HTTPException(400, 'u not followed at this course')

    if not user_topic.topic.is_active:
        raise HTTPException(400, 'This topic are inactive')

    if not user_topic.by_user_course.is_active:
        raise HTTPException(400, 'This course are inactive')

    if not user_topic.ready_to_pass:
        raise HTTPException(400, 'u cannot pass this topic, please pass previous')

    current_topic = user_topic.topic

    questions = list(Question
                .select()
                .where(Question.by_topic == current_topic.id, Question.is_active)
    )

    questions_with_answers = []
    
    for question in questions:
        answers = list(question.created_answers)
        questions_with_answers.append({
            **question.dump,
            'answer_options': [
                {
                    'id': answer.id,
                    'text': '' if question.question_type == 'text' else answer.text
                } for answer in answers
            ]
        })

    if not current_topic.number_in_course:
        return JSONResponse(questions_with_answers)
    
    user_questions: list[UserQuestion] = list(UserQuestion
                        .select()
                        .join(UserTopic, on=(UserQuestion.by_user_topic == UserTopic.id))
                        .join(Topic, on=(UserTopic.topic == Topic.id))
                        .where(
                            Topic.by_course == user_topic.by_user_course.course,
                            Topic.number_in_course < current_topic.number_in_course,
                            UserQuestion.question_score.between(0, 0.5)
                        )
    )
    adaptive_questions: list[UserQuestion] = []

    for _ in range(min(2, len(user_questions))):
        question = random.choice(user_questions)
        user_questions.remove(question)
        adaptive_questions.append(question)
    
    for question in adaptive_questions:
        AdaptiveQuestion.get_or_create(
            user = user.username,
            for_user_topic = user_topic,
            by_user_topic = question.by_user_topic,
            question = question.question,
        )
        questions_with_answers.insert(
            random.randint(0, len(questions_with_answers)-1),
            {
                **question.question.dump,
                'answer_options': [
                    {
                        'id': answer.id,
                        'text': '' if question.question.question_type == 'text' else answer.text
                    } for answer in question.question.created_answers
                ]
            }
        )
    
    return JSONResponse(questions_with_answers)


def submit_topic_answers(user: UserOut, topic_answers_data: TopicSubmitAnswers):
    user_topic = UserTopic.get_or_none(UserTopic.id == topic_answers_data.user_topic_id, UserTopic.user == user.username)


    if not user_topic:
        raise HTTPException(400, 'topic not found or u not followed at course')

    if not user_topic.topic.is_active:
        raise HTTPException(400, 'This topic are inactive')

    if not user_topic.ready_to_pass:
        raise HTTPException(400, 'u cannot pass this topic')

    score = 0
    

    submit_questions = topic_answers_data.questions
    submit_adaptive_questions: List[Union[SubmitChoiceQuestionUnit, SubmitTextQuestionUnit]] = []

    for question in submit_questions:
        if question.by_topic != user_topic.topic.id:
            submit_adaptive_questions.append(question)

    submit_adaptive_questions.sort(key=lambda q: q.id)
    submit_questions.sort(key=lambda q: q.id)

    created_questions = list(Question
                        .select()
                        .where(Question.by_topic == user_topic.topic.id, Question.is_active)
    )

    #adding all adaptive questions that are in topic to pass
    for q in submit_adaptive_questions:
        adaptive_question = AdaptiveQuestion.get_or_none(
            AdaptiveQuestion.question == Question.get_or_none(Question.id == q.id), 
            AdaptiveQuestion.for_user_topic == user_topic
        )
        if not adaptive_question:
            raise HTTPException(400 ,'question IDs is not matches')
        created_questions.append(adaptive_question.question)
    
    created_questions.sort(key=lambda q: q.id)

    if len(submit_questions) != len(created_questions):
        raise HTTPException(400, 'u didn`t answer all questions')

    question_count = len(submit_questions)

    #logic of submiting
    for index, submit_question in enumerate(submit_questions):
        created_question = created_questions[index]
        if submit_question.id != created_question.id:
            raise HTTPException(400 ,'question IDs is not matches')
        
        question_score = 0
            
        if submit_question.type == 'choice':
            if created_question.question_type == 'text':
                raise HTTPException(400, 'question types not matches')

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

            for index, submit_answer in enumerate(submit_answers):
                created_answer: Answer = created_answers[index]
                if created_answer.id != submit_answer.id:
                    raise HTTPException(400, 'answer IDs is not matches')

                if created_answer.is_correct == submit_answer.is_correct:
                    score += 1 / (answer_count * question_count)
                    question_score += 1 / answer_count
            
        elif submit_question.type == 'text':
            if created_question.question_type != 'text':
                raise HTTPException(400, 'question types not matches')

            created_answers = list(Answer
                                        .select()
                                        .where(Answer.by_question == submit_question.id)
            )
            for created_answer in created_answers:
                if created_answer.text == submit_question.text:
                    question_score = 1
                    score += 1 /question_count
                
        
        #submiting static questions
        if submit_question.by_topic == user_topic.topic.id:
            uk, is_created = UserQuestion.get_or_create(
                user = user.username,
                by_user_topic = user_topic,
                question = created_question,
                defaults = {
                    'question_score': question_score
                }
            )
            if not is_created:
                uk.question_score = max(question_score, uk.question_score)
                uk.save()

            if submit_question.type == 'text':
                ua, _ = UserTextAnswer.get_or_create(
                    user = user.username,
                    question = created_question,
                    by_user_topic = user_topic,
                    for_user_question = uk,
                    text = submit_question.text
                )
                ua.text = submit_question.text
                ua.is_correct = max(ua.is_correct, bool(question_score))
                ua.save()

        #submiting adaptive question
        else:
            user_question = UserQuestion.get_or_none(
                UserQuestion.question == Question.get_or_none(
                    Question.id == submit_question.id
                ), 
                user = user.username
            )
            if not user_question:
                raise HTTPException(400 ,'How u get adaptive question before pass that question firstly?')
            user_question.question_score = question_score
            if submit_question.type == 'text':
                ua = UserTextAnswer.get_or_none(
                    UserTextAnswer.by_user_topic == user_question.by_user_topic,
                    UserTextAnswer.for_user_question == user_question
                )
                ua.is_correct = bool(question_score)
            user_question.save()
            user_topic_unit = UserTopic.get_or_none(
                UserTopic.user == user.username, 
                UserTopic.topic == Topic.get_or_none(
                    Topic.id == submit_question.by_topic
                )
            )
            user_questions_by_topic = UserQuestion.select().where(UserQuestion.by_user_topic == user_topic_unit)
            topic_score = 0

            for q in user_questions_by_topic:
                topic_score += q.question_score / len(user_questions_by_topic)
            user_topic_unit.topic_progress = max(topic_score, user_topic_unit.topic_progress)
            user_topic_unit.save()

            adaptive_question_unit = AdaptiveQuestion.get_or_none(
                AdaptiveQuestion.question == Question.get_or_none(Question.id == submit_question.id), 
                AdaptiveQuestion.for_user_topic == user_topic
            )
            if not adaptive_question_unit:
                raise HTTPException(400, 'cant find this adaptive question')
            adaptive_question_unit.delete_instance()


    #grading user topic
    if user_topic.topic_progress < score:
        user_topic.topic_progress = round(score, 3)
    user_course = user_topic.by_user_course
    if user_topic.topic_progress >= 0.8 and not user_topic.is_completed:
        user_course.completed_topic_number += 1
        user_topic.is_completed = True
        user_course.course_progress = (user_course.completed_topic_number / len(Topic.select().where(Topic.by_course == user_course.course, Topic.is_active))) * 100

        ut = (UserTopic
            .select()
            .join(Topic)
            .where(
                UserTopic.topic.number_in_course == user_topic.topic.number_in_course + 1, 
                UserTopic.by_user_course == user_topic.by_user_course
            )
            .first()
        )
        if ut:
            ut.ready_to_pass = True
            ut.save()
    user_course.save()
    user_topic.save()

    return JSONResponse({'score': round(score, 3)})

@database.atomic()
def add_topic_to_user_course(user: UserOut, topic_id: str):
    current_topic: Topic = Topic.get_or_none(Topic.id == topic_id)
    if not current_topic:
        raise HTTPException(404)

    user_course = UserCourse.get_or_none(
        UserCourse.user == user.username,
        UserCourse.course == current_topic.by_course,
        UserCourse.is_active
    )
    if not user_course:
        raise HTTPException(400)
    ut: UserTopic = (UserTopic
            .select()
            .join(Topic)
            .where(
                UserTopic.topic.number_in_course == current_topic.number_in_course - 1, 
                UserTopic.by_user_course == user_course
            )
            .first()
    )

    user_topic, is_created = UserTopic.get_or_create(
        user = user.username,
        topic = current_topic,
        by_user_course = user_course,
        defaults = {
            'ready_to_pass': True if current_topic.number_in_course == 0 else ut.is_completed
        }
    )

    if not is_created:
        raise HTTPException(400, 'already added')

    return JSONResponse(user_topic.dump)