from db import database, Course
from peewee import fn
from shemas import UserOut
from fastapi.responses import JSONResponse


def sqlite_lower(value):
    return value.lower()

database.register_function(lambda x: x.lower(), 'lower')


@database.atomic()
def search_courses(user: UserOut, search_query: str):
    
    searched_courses = Course.select().where(
        fn.lower(Course.title).contains(search_query.lower()),
        Course.created_by != user.username
    )
    return JSONResponse([course.__data__ for course in searched_courses])