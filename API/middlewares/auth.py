from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from dependencies.dependencies import get_user_repository
from config import oauth2_scheme
from utils.crypt_utils import decode_jwt


class AuthorizationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        public_paths = ["/auth/login", "/auth/register", '/auth/logout', "/docs", "/openapi.json"]
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)

            
        cookie_key = 'access_token'
        cookie_token = request.cookies.get(cookie_key)
        bearer_token = await oauth2_scheme(request)

        credentials_exception = JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={'detail':"Could not validate credentials"}
        )

        if not cookie_token and not bearer_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={'detail': 'Not authentificated'}
            )

        token = str(cookie_token) or bearer_token
        if token is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={'detail': 'Not authentificated'}
            )

        try:
            payload = decode_jwt(token=token)
        except:
            return credentials_exception


        username: str = payload.get("sub")
        current_user = get_user_repository().get_user_by_username(username)

        if username is None or current_user is None:
            return credentials_exception

        request.state.user = current_user
        request.state.payload = payload

        return await call_next(request)


def add_middleware(app: FastAPI):
    app.add_middleware(AuthorizationMiddleware)
    return app