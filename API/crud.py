"""python interaction with database"""
from typing import Dict
from db import database, User, Poll, Question, AnswerOption, UserAnswer
from utils import get_password_hash
from shemas import UserCreate, PollCreate, PollAnswersSubmit, UserOut, PollWithQuestions

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse


@database.atomic()
async def create_user(user: UserCreate):
    try:
        currect_user = User.create(
            username=user.username,
            name=user.name,
            telegram_link=user.telegram_link,
            password_hash=get_password_hash(user.password),
            role=user.role)

    except:
        raise HTTPException(status_code=400, detail="Username already registered")

    return "Username registered"


@database.atomic()
async def find_user(username) :
    user = User.select().where(User.username == username)

    for i in user:
        return {
            "id": i.id,
            "username": i.username,
            "name": i.name,
            "telegram_link": i.telegram_link,
            "is_active": i.is_active,
            "role": i.role
        }

    raise HTTPException(
        detail='user not finded',
        status_code=404
    )


@database.atomic()
async def find_password(username):
    user = User.select().where(User.username == username)

    for i in user:
        return i.password_hash


@database.atomic()
async def create_poll(poll: PollCreate, user: UserOut):
    try:
        db_poll = Poll.create(
            title=poll.title,
            description=poll.description,
            created_by=user.username
        )
        for question in poll.questions:
            db_question = Question.create(
                poll=db_poll,
                text=question.text,
                question_type=question.question_type
            )
            for option in question.answer_options:
                AnswerOption.create(
                    text=option.text,
                    is_correct=option.is_correct,
                    question=db_question
                )

    except:
        raise HTTPException(status_code=400, detail="Pollname already registered")

    return db_poll.__data__


@database.atomic()
async def find_polls():
    try:
        list_polls = []
        polls = Poll.select()

    except:
        return "Polls not defiend"

    for i in polls:
        list_polls.append({"id": i.id,
                           "title": i.title,
                           "description": i.description,
                           "created_at": i.created_at,
                           "created_by_id": i.created_by_id,
                           "is_active": i.is_active, })

    return list_polls


@database.atomic()
async def find_poll(poll_id):
    if not Poll.get_or_none(Poll.id == poll_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found or inactive")
    else:
        return JSONResponse(status_code=200, content='Poll finded')


@database.atomic()
async def find_questions(poll_id):
    # Проверяем, что опрос существует и активен
    poll = Poll.get_or_none(Poll.id == poll_id)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found or inactive")

    # Получаем все вопросы с вариантами ответов
    questions = (
        Question
            .select()
            .where(Question.poll == poll_id)
            .prefetch(AnswerOption)
    )

    response = {
        'id': poll.id,
        "title": poll.title,
        "description": poll.description,
        "questions": [],
    }
    
    for question in questions:
        q_data = {
            'id': question.id,
            "text": question.text,
            "question_type": question.question_type,
            "answer_options": [
                {
                    'id': option.id,
                    "text": option.text
                }
                for option in question.answer_options
            ]
        }
        response["questions"].append(q_data)

    return response


@database.atomic()
def submit_poll_answers(
    poll_id: int,
    answers_data: PollAnswersSubmit,
    current_user: UserOut
) -> list:
    """
    Сохраняет ответы пользователя на вопросы опроса с валидацией

    Args:
        poll_id: ID опроса
        answers_data: Данные ответов пользователя
        current_user: Текущий авторизованный пользователь

    Returns:
        Список сохраненных вариантов ответов

    Raises:
        HTTPException: В случае ошибок валидации
    """
    # Проверяем существование и активность опроса
    poll = Poll.get_or_none(Poll.id == poll_id)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Опрос не найден или не активен"
        )

    #  Проверка, что пользователь еще не отвечал на этот опрос
    existing_answers = UserAnswer.select().where(
        (UserAnswer.user == current_user.username) &
        (UserAnswer.question << Question.select().where(Question.poll == poll_id))
    ).exists()

    if existing_answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,    
            detail="Вы уже проходили этот опрос"
        )

    # Получаем общее количество вопросов в опросе
    question_count = Question.select().where(Question.poll == poll_id).count()

    # Проверяем отсутствие дубликатов вопросов в ответах
    seen_questions = set()
    for answer in answers_data.answers:
        if answer.question_id in seen_questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Обнаружены повторяющиеся вопросы (ID: {answer.question_id})"
            )
        seen_questions.add(answer.question_id)

    saved_answers = []

    # Обрабатываем каждый ответ
    for answer in answers_data.answers:
        # Получаем вопрос и проверяем его принадлежность к опросу
        question = Question.get_or_none(
            (Question.id == answer.question_id) &
            (Question.poll == poll_id)
        )

        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Вопрос не найден"
            )

        # Нормализуем ID вариантов ответа (преобразуем int в list[int])
        option_ids = (
            [answer.selected_option_ids]
            if isinstance(answer.selected_option_ids, int)
            else answer.selected_option_ids
        )

        # Валидация типа вопроса
        if question.question_type == "single_choice" and len(option_ids) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Вопрос {question.id} допускает только один вариант ответа"
            )

        # Обрабатываем каждый выбранный вариант
        for option_id in option_ids:
            option = AnswerOption.get_or_none(
                (AnswerOption.id == option_id) &
                (AnswerOption.question == question)
            )

            if not option:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Вариант ответа не найден{option_id}"
                )

            saved_answers.append(option)

    # Проверяем что ответили на все вопросы
    if len(saved_answers) != question_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы ответили не на все вопросы"
        )

    # Сохраняем ответы в базу данных
    for option in saved_answers:
        UserAnswer.create(
            user=current_user.username,
            question=question,
            answer_option=option
        )

    return saved_answers


@database.atomic()
def check_user_answers_from_db(username: str) -> Dict:
    """
    Проверяет ответы пользователя из базы данных на правильность

    Args:
        username: Имя пользователя (учителя)

    Returns:
        Словарь с результатами по всем опросам пользователя:
        {
            "teacher": str,
            "polls": [
                {
                    "poll_id": int,
                    "poll_title": str,
                    "total_questions": int,
                    "answered_questions": int,
                    "correct_answers": int,
                    "score": float,
                    "details": List[Dict]
                },
                ...
            ]
        }

    Raises:
        HTTPException: Если данные не найдены
    """
    try:
        # Получаем все опросы, созданные этим учителем
        teacher_polls = (Poll
                        .select()
                        .where((Poll.created_by == username) & (Poll.is_active == True))
                        .order_by(Poll.created_at.desc()))
        
        result = {
            "teacher": username,
            "polls": []
        }

        for poll in teacher_polls:
            # Получаем все вопросы для этого опроса
            questions = (Question
                        .select()
                        .where(Question.poll == poll)
                        .count())
            
            # Получаем все ответы студентов на этот опрос
            user_answers = (UserAnswer
                          .select()
                          .join(Question)
                          .where(Question.poll == poll))
            
            # Группируем ответы по пользователям
            answers_by_user = {}
            for answer in user_answers:
                if answer.user.username not in answers_by_user:
                    answers_by_user[answer.user.username] = []
                answers_by_user[answer.user.username].append(answer)
            
            # Собираем статистику по опросу
            poll_stats = {
                "poll_id": poll.id,
                "poll_title": poll.title,
                "total_questions": questions,
                "answered_users": len(answers_by_user),
                "user_stats": []
            }

            for student, answers in answers_by_user.items():
                correct = sum(1 for a in answers if a.answer_option.is_correct)
                total = len(answers)
                
                poll_stats["user_stats"].append({
                    "student": student,
                    "answered_questions": total,
                    "correct_answers": correct,
                    "score": round(correct / questions * 100, 2) if questions > 0 else 0
                })

            result["polls"].append(poll_stats)

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user answers: {str(e)}"
        )


if __name__ == "__main__":
    print(find_questions(2))
