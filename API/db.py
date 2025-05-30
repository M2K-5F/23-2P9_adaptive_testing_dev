"""database discription"""
from datetime import datetime, timedelta

from peewee import SqliteDatabase, CharField, DateTimeField, BooleanField, \
                    TextField, ForeignKeyField, AutoField, IntegerField, Model, fn

database = SqliteDatabase('my_database.db')


class BaseModel(Model):
    class Meta:
        database = database


class User(BaseModel):
    username = CharField(unique=True)
    name = CharField()
    telegram_link = CharField()
    password_hash = CharField()
    role = CharField()
    created_at = DateTimeField(default=datetime.now)
    is_active = BooleanField(default=True)

    def is_teacher(self):
        return self.role == 'teacher'


class Poll(BaseModel):
    id = AutoField(primary_key=True)
    title = CharField(unique=True)
    description = TextField(null=True)
    created_by = ForeignKeyField(User, field=User.username, backref='polls')
    created_at = DateTimeField(default=datetime.now)
    is_active = BooleanField(default=True)

class Question(BaseModel):
    id = AutoField(primary_key=True)
    id_in_poll = IntegerField()
    poll = ForeignKeyField(Poll, backref='questions')
    text = TextField()
    question_type = CharField(default='single_choice')

    def save(self, *args, **kwargs):
        if not self.id:  # Только для новых записей
            # Находим максимальный id_in_question для этого вопроса
            max_id = Question.select(fn.MAX(Question.id_in_poll)).where(
                Question.poll == self.poll
            ).scalar() or 0
            self.id_in_poll = max_id + 1
        return super().save(*args, **kwargs)


class AnswerOption(BaseModel):
    id = AutoField(primary_key=True)
    id_in_question = IntegerField()
    question = ForeignKeyField(Question, backref='answer_options')
    text = TextField()
    is_correct = BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.id:  # Только для новых записей
            # Находим максимальный id_in_question для этого вопроса
            max_id = AnswerOption.select(fn.MAX(AnswerOption.id_in_question)).where(
                AnswerOption.question == self.question
            ).scalar() or 0
            self.id_in_question = max_id + 1
        return super().save(*args, **kwargs)


class UserAnswer(BaseModel):
    user = ForeignKeyField(User, field=User.username, backref='answers')
    question = ForeignKeyField(Question, backref='user_answers')
    answer_option = ForeignKeyField(AnswerOption, backref='selected_by')
    answered_at = DateTimeField(default=datetime.now)


if __name__ == "__main__":
    database.connect()
    database.drop_tables([User, Poll, Question, AnswerOption, UserAnswer])
    database.create_tables([User, Poll, Question, AnswerOption, UserAnswer])
    database.close()
