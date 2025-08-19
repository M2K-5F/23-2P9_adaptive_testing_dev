from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from db import Topic, UserCourse, UserQuestion, UserTopic, database, User, Course
from peewee import fn
import peewee
from shemas import UserOut



@database.atomic()
def course_create(course_title, user: UserOut):

    if Course.get_or_none(
        Course.title == course_title, 
        Course.created_by == User.get_or_none(
            User.username == user.username
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course already created"
        )
    try:
        data: Course = Course.create(
            title = course_title,
            created_by = user.username,
        )

    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some exc"
        )

    return JSONResponse(
        content={
            "title": data.title,
        }
    )


@database.atomic()
def change_activity_of_course(course_id: str, user: UserOut):
    current_course = Course.get_or_none(Course.id == course_id)
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    try:
        current_course.is_active = not current_course.is_active
        current_course.save()
        return current_course.__data__        
    
    except: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )

        
@database.atomic()
def get_created_by_teacher_courses(user: UserOut):
        courses = Course.select().where(Course.created_by == user.username)

        return JSONResponse([course.__data__ for course in courses])


@database.atomic()
def get_course_statistics(user: UserOut, course_id: int):
    current_course = Course.get_or_none(Course.id == course_id, Course.created_by == user.username)
    if not current_course:
        raise HTTPException(404, "Курс не найден или у вас нет доступа")

    user_courses = (UserCourse.select()
                    .where(UserCourse.course == current_course))
    
    statistics = []
    avg_course_progress = 0
    
    for user_course in user_courses:
            student = user_course.user
        
            topics = (Topic.select()
                    .where(Topic.by_course == course_id)
                    .order_by(Topic.number_in_course))
            
            avg_course_progress += round(user_course.course_progress, 2)
            
            student_stats = {
                'user_id': student.id,
                'username': student.username,
                "telegram_link": student.telegram_link,
                'name': student.name,
                'course_progress': round(user_course.course_progress, 2),
                'completed_topics': user_course.completed_topic_number,
                'total_topics': topics.count(),
                'topics_details': []
            }
            
            # Собираем статистику по темам
            for topic in topics:
                    user_topic = UserTopic.get_or_none(
                        UserTopic.user == student.username,
                        UserTopic.topic == topic.id,
                        UserTopic.by_user_course == user_course.id
                    )
                    if not user_topic:
                        student_stats['topics_details'].append({
                            'topic_id': topic.id,
                            'topic_title': topic.title,
                            'is_completed': False,
                            'topic_progress': 0,
                            'question_count': topic.question_count,
                            'average_score': 0,
                            'ready_to_pass': False
                        })
                    else:
                        student_stats['topics_details'].append({
                            'topic_id': topic.id,
                            'topic_title': topic.title,
                            'is_completed': user_topic.is_completed,
                            'topic_progress': round(user_topic.topic_progress, 3),
                            'question_count': topic.question_count,
                            'average_score': round(user_topic.topic_progress * 100, 2),
                            'ready_to_pass': user_topic.ready_to_pass
                        })
            
            statistics.append(student_stats)
    to_return = {
        "course_id": course_id,
        "course_title": current_course.title,
        "average_progress": round(avg_course_progress / len(statistics), 2) if len(statistics) else 0,
        "total_students": len(statistics),
        "students": statistics
    }
    return JSONResponse(to_return)

