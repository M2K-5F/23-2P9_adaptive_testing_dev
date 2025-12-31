"""database discription"""
from datetime import datetime
from email.policy import default
from peewee import AutoField, SqliteDatabase, CharField, DateTimeField, BooleanField, Model, ForeignKeyField, FloatField, IntegerField
from playhouse.shortcuts import model_to_dict

from backend.config.adaptivity_config import ADAPTIVITY_PROFILES
from config.weight_config import WEIGHT_ADJUSTMENT_PROFILES
from shemas import Roles
from utils import get_password_hash

database = SqliteDatabase('my_database.db')

def serialize(obj):
    if isinstance(obj, dict):
        to_return = {}
        for key, value in obj.items():
            if key != 'password_hash':
                to_return = {**to_return, key: serialize(value)}
        return to_return
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif hasattr(obj, '__dict__'):
        return serialize(obj.__dict__)
    else:
        return obj


class Table(Model):
    id = AutoField()
    created_at = DateTimeField(default=datetime.now)
    
    class Meta:
        database = database

    @property
    def dump(self):
        data = model_to_dict(self, recurse=True, max_depth=1)
        
        return dict(serialize(data))

    @property
    def recdump(self):
        data = model_to_dict(self, recurse=True, max_depth=2)
        return dict(serialize(data))


class User(Table):###
    username = CharField(unique=True)
    name = CharField(unique=True)
    telegram_link = CharField()
    password_hash = CharField()
    is_active = BooleanField(default=True)


class Role(Table):###
    status=CharField()


class UserRole(Table):###
    user = ForeignKeyField(
        User, backref="user_role", on_update="CASCADE", on_delete="CASCADE"
    )
    role = ForeignKeyField(
        Role, backref="user_role", on_update="CASCADE", on_delete="CASCADE"
    )


class AdaptivityProfile(Table):
    name = CharField()
    question_weight = FloatField()
    last_score = FloatField()
    time_since_last = FloatField()
    max_adaptive_questions_count = IntegerField()
    max_adaptive_questions_ratio = FloatField()


class WeightProfile(Table):
    name = CharField()
    base_weight = FloatField()
    base_step = FloatField()
    min_weight = FloatField()
    max_weight = FloatField()
    score_bias = FloatField()


class Course(Table):###
    title = CharField(max_length=64)
    created_by = ForeignKeyField(User, field=User.username, backref="created_courses")
    is_active = BooleanField(default=True)
    description = CharField(max_length=128)
    topic_count = IntegerField(default=0)
    group_count = IntegerField(default=0)
    student_count = IntegerField(default=0)


class Group(Table):
    by_course = ForeignKeyField(Course)
    title = CharField(max_length=128)
    max_student_count = IntegerField(default=30)
    student_count = IntegerField(default=0)
    created_by = ForeignKeyField(User, field=User.username)
    profile = ForeignKeyField(AdaptivityProfile, field=AdaptivityProfile.name)
    is_active = BooleanField(default=True)
    type = CharField(default='public')
    passkey = CharField(max_length=16, default='')


class Topic(Table):
    by_course = ForeignKeyField(Course, backref='topics')
    created_by = ForeignKeyField(User, field=User.username, backref="created_topics")
    title = CharField(max_length=64)
    description = CharField(max_length=128)
    is_active = BooleanField(default=True)
    number_in_course = IntegerField()
    question_count = IntegerField(default=0)
    score_for_pass = FloatField(default=80)


class Question(Table):
    text = CharField(max_length=128)
    by_topic = ForeignKeyField(Topic, backref='questions')
    question_type = CharField()
    is_active = BooleanField(default=True)
    base_weight_profile = ForeignKeyField(WeightProfile, field=WeightProfile.name)


class Answer(Table):
    text = CharField(max_length=64)
    is_correct = BooleanField()
    by_question = ForeignKeyField(Question, backref="answers")


class UserGroup(Table):
    user = ForeignKeyField(User, field=User.username, backref='user_groups')
    group = ForeignKeyField(Group, backref='user_groups')
    course = ForeignKeyField(Course)
    progress = FloatField(default=0)
    completed_topic_count = IntegerField(default=0)


class QuestionWeight(Table):
    group = ForeignKeyField(Group)
    question = ForeignKeyField(Question)
    weight = FloatField()
    profile = ForeignKeyField(WeightProfile, field=WeightProfile.name)


class UserTopic(Table):
    user = ForeignKeyField(User, field=User.username)
    topic = ForeignKeyField(Topic)
    by_user_group = ForeignKeyField(UserGroup)
    is_completed = BooleanField(default=False)
    is_attempted = BooleanField(default=False)
    is_available = BooleanField(default=False)
    is_active = BooleanField(default=True)
    progress = FloatField(default=0)
    attempt_count = IntegerField(default=0)


class UserQuestion(Table):
    user = ForeignKeyField(User, field=User.username)
    question = ForeignKeyField(Question)
    by_user_topic = ForeignKeyField(UserTopic)
    progress = FloatField(default=0)
    is_active = BooleanField(default=True)
    

class UserChoiceAnswer(Table):
    user = ForeignKeyField(User, field=User.username)
    answer = ForeignKeyField(Answer)
    by_user_question = ForeignKeyField(UserQuestion)
    is_choised = BooleanField(default=0)

    
class UserTextAnswer(Table):
    user = ForeignKeyField(User, field=User.username)
    question = ForeignKeyField(Question)
    by_user_topic = ForeignKeyField(UserTopic)
    for_user_question = ForeignKeyField(UserQuestion, backref='user_text_answers')
    text = CharField(max_length=60)
    progress = FloatField(default=0)
    is_active = BooleanField(default=True)


class TopicAttempt(Table):
    user_topic = ForeignKeyField(UserTopic, backref='attempts')
    is_active = BooleanField(default=True)


class QuestionAttempt(Table):
    topic_attempt = ForeignKeyField(TopicAttempt, backref='questions')
    question = ForeignKeyField(Question)
    is_adaptive = BooleanField()
    order_index = IntegerField()


if __name__ == "__main__":
    database.connect()
    database.register_function(lambda x: x.lower(), 'lower')
    database.create_tables([
        User, Role, UserRole, 
        Course, Topic, Question,
        Answer, UserQuestion, 
        UserTopic, UserTextAnswer, 
        Group, UserGroup, QuestionWeight,
        TopicAttempt, QuestionAttempt,
        AdaptivityProfile, 
        WeightProfile
    ])
    database.close()

    student_role, _ = Role.get_or_create(status=Roles.STUDENT)
    teacher_role, _ = Role.get_or_create(status=Roles.TEACHER)
    base_teacher, _ = User.get_or_create(
        username = 'teacher',
        name = 'teacher',
        defaults={
            'telegram_link': 'https://t.me/teacher_tg',
            'password_hash': get_password_hash('12345')
        }
    )
    
    UserRole.get_or_create(
        user = base_teacher,
        role = teacher_role
    )

    UserRole.get_or_create(
        user = base_teacher,
        role = student_role
    )

    AdaptivityProfile.get_or_create(
        name = 'Aggressive',
        defaults = ADAPTIVITY_PROFILES['AGGRESSIVE']
    )

    AdaptivityProfile.get_or_create(
        name = 'Balanced',
        defaults = ADAPTIVITY_PROFILES['BALANCED']
    )

    AdaptivityProfile.get_or_create(
        name = 'Gentle',
        defaults = ADAPTIVITY_PROFILES['GENTLE']
    )

    WeightProfile.get_or_create(
        name = 'Aggressive',
        defaults = WEIGHT_ADJUSTMENT_PROFILES['AGGRESSIVE']
    )

    WeightProfile.get_or_create(
        name = 'Balanced',
        defaults = WEIGHT_ADJUSTMENT_PROFILES["BALANCED"]
    )
    
    WeightProfile.get_or_create(
        name = 'Gentle',
        defaults = WEIGHT_ADJUSTMENT_PROFILES['GENTLE']
    )