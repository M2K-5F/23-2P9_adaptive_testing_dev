from typing import Any, List, Callable, TypeVar, Union
from fastapi import HTTPException, status
from config import weight_config
from models import Question, Answer, UserTopic
from peewee import FloatField
from shemas import SubmitQuestion, SubmitChoiceQuestionUnit, SubmitTextQuestionUnit


def get_question_score(
    submit_question: SubmitQuestion, 
    created_question: Question,
):
    if submit_question.type == 'choice':
        if created_question.question_type == 'text':
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "question types not matches"
            )

        question_score = get_choice_question_score(
            submit_question, 
            created_question
        )
        
    else:
        if created_question.question_type != 'text':
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "question types not matches"
            )
        
        question_score = get_text_question_score(
            submit_question, created_question
        )
    
    return question_score


def get_choice_question_score(
    submit_question: SubmitChoiceQuestionUnit, 
    created_question: Question
):
    
    submit_answers = submit_question.answer_options
    created_answers: List[Answer] = list(getattr(created_question, 'created_answers'))

    submit_answers.sort(key=lambda ans: ans.id)
    created_answers.sort(key=lambda a: getattr(a, "id"))

    if len(submit_answers) != len(created_answers):
        raise HTTPException(400, 'u didn`t answer all answers')

    correct_answer_count = sum(1 for a in created_answers if a.is_correct)
    
    correct_answered: int = 0
    uncorrect_answered: int = 0

    for index, submit_answer in enumerate(submit_answers):
        created_answer: Answer = created_answers[index]
        if created_answer.id != submit_answer.id:
            raise HTTPException(400, 'answer IDs is not matches')

        if created_answer.is_correct == submit_answer.is_correct:
            if created_answer.is_correct:
                correct_answered += 1
        else:
            if not created_answer.is_correct:
                return 0
    
    return correct_answered / correct_answer_count


def get_text_question_score(
    submit_question: SubmitTextQuestionUnit,
    created_question: Question
):
    created_answers = getattr(created_question, 'answers')
    question_score: float = 0

    for created_answer in created_answers:
        if created_answer.text == submit_question.text:
            question_score = 1
            break
    return question_score


T = TypeVar('T')

def get_average_score(instances: List[T], key: Callable[[T], Union[float, FloatField]]) -> float:
    score: float = 0

    count = len(instances)

    for instance in instances:
        score += key(instance)  #pyright: ignore
    
    return score / count