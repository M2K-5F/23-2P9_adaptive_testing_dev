"""database discription"""
from datetime import datetime
from peewee import AutoField, SqliteDatabase, CharField, DateTimeField, BooleanField, Model, ForeignKeyField, FloatField, IntegerField

from shemas import Roles, UserOut
from Utils import get_password_hash

database = SqliteDatabase('my_database.db')


class Table(Model):
    id = AutoField()
    class Meta:
        database = database


class User(Table):
    username = CharField(unique=True)
    name = CharField(unique=True)
    telegram_link = CharField()
    password_hash = CharField()
    created_at = DateTimeField(default=datetime.now)
    is_active = BooleanField(default=True)


class Role(Table):
    status=CharField()


class UserRole(Table):
    user = ForeignKeyField(
        User, backref="user_role", on_update="CASCADE", on_delete="CASCADE"
    )
    role = ForeignKeyField(
        Role, backref="user_role", on_update="CASCADE", on_delete="CASCADE"
    )


class Course(Table):
    title = CharField(max_length=30)
    created_by = ForeignKeyField(User, field=User.username, backref="created_courses")
    is_active = BooleanField(default=True)


class Topic(Table):
    by_course = ForeignKeyField(Course)
    created_by = ForeignKeyField(User, field=User.username, backref="created_topics")
    title = CharField(max_length=60)
    description = CharField(max_length=120)
    is_active = BooleanField(default=True)
    number_in_course = IntegerField()
    question_count = IntegerField(default=0)


class Question(Table):
    text = CharField(max_length=30)
    by_topic = ForeignKeyField(Topic, backref='created_questions')
    question_type = CharField(default='single')
    is_active = BooleanField(default=True)


class Answer(Table):
    text = CharField(max_length=30)
    is_correct = BooleanField()
    by_question = ForeignKeyField(Question, backref="created_answers")


class UserCourse(Table):
    user = ForeignKeyField(User, field=User.username, backref="user_courses")
    course = ForeignKeyField(Course, backref="user_courses")
    is_active = BooleanField(default=True)
    completed_topic_number = IntegerField(default=0)
    course_progress = FloatField(default=0)


class UserTopic(Table):
    user = ForeignKeyField(User, field=User.username, backref="user_topics")
    topic = ForeignKeyField(Topic)
    by_user_course = ForeignKeyField(UserCourse)
    ready_to_pass = BooleanField(default=False)
    is_completed = BooleanField(default=False)
    topic_progress = FloatField(default=0)

class UserQuestion(Table):
    user = ForeignKeyField(User, field=User.username, backref="user_questions")
    by_user_topic = ForeignKeyField(UserTopic)
    question = ForeignKeyField(Question)
    # by_topic = ForeignKeyField(Topic)
    question_score = FloatField(default=0)


if __name__ == "__main__":
    database.connect()
    database.create_tables([User, Role, UserRole, Course, Topic, Question, Answer, UserCourse, UserQuestion, UserTopic])
    database.close()

    student_role, _ = Role.get_or_create(status=Roles.STUDENT)
    teacher_role, _ = Role.get_or_create(status=Roles.TEACHER)
    try:
        base_teacher, _ = User.get_or_create(
            username = 'teacher',
            name = 'teacher',
            defaults={
                'telegram_link': 'https://t.me/teacher_tg.com',
                'password_hash': get_password_hash('12345')
            })
        UserRole.get_or_create(
            user = base_teacher,
            role = teacher_role
        )

        UserRole.get_or_create(
            user = base_teacher,
            role = student_role
        )
    except:
        print('passed')