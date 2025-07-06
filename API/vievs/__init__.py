"""descriptions for all user interactions (API)"""

from fastapi import FastAPI 
from .auth import auth_router
from .course import course_router
from .question import question_router
from .topic import topic_router
from .search import search_router

def add_routers(app: FastAPI):
    app.include_router(auth_router)
    app.include_router(course_router)
    app.include_router(question_router)
    app.include_router(topic_router)
    app.include_router(search_router)