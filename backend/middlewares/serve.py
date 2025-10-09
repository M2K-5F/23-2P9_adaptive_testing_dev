from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from dependencies.dependencies import get_user_repository
from config import oauth2_scheme
from utils.crypt_utils import decode_jwt
from config.path_config import API_PREFIX, PUBLIC_PATHS


class ServeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = datetime.now()
        if not request.url.path.startswith((API_PREFIX, '/public', '/assets', '/docs', '/openapi.json')):
            return FileResponse("../dist/index.html")

        response = await call_next(request)
        print((datetime.now() - start).total_seconds())
        return response


def add_middleware(app: FastAPI):
    app.add_middleware(ServeMiddleware)
