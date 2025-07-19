from fastapi import APIRouter
from .views.auth import auth_router
from .views.search import search_router

shared_router = APIRouter(prefix='')

shared_router.include_router(search_router)
shared_router.include_router(auth_router)