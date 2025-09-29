from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from dependencies.user import get_user_from_request
from dependencies.dependencies import get_techer_topic_service, TTS
from shemas import TopicToCreate, UserOut

topic_router = APIRouter(prefix="/topic", tags=["Teacher/Topics"])

@topic_router.post('/create')
def create_teacher_topic(
    current_user: UserOut = Depends(get_user_from_request),
    created_topic: TopicToCreate = Body(),
    service: TTS = Depends(get_techer_topic_service)
) -> JSONResponse:

    return service.create_topic(current_user, created_topic)


@topic_router.put('/arch')
def arch_topic(
    current_user = Depends(get_user_from_request),
    topic_id: str = Query(),
    service: TTS = Depends(get_techer_topic_service)
) -> JSONResponse:
    return  service.arch_topic(current_user, topic_id)


@topic_router.put('/unarch')
def unarch_topic(
    current_user = Depends(get_user_from_request),
    topic_id: str = Query(),
    service: TTS = Depends(get_techer_topic_service)
) -> JSONResponse:
    return  service.unarch_topic(current_user, topic_id)