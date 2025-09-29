from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import FastAPI, Request, Response
from datetime import datetime, timedelta, timezone
from config.jwt_config import AuthJWT
from utils import encode_jwt


class CookieRefreshMiddleware(BaseHTTPMiddleware):
    """Middelawe which verify token payload & returns new token with refresed expires time"""
    async def dispatch(self, request: Request, call_next) -> Response:
        if not hasattr(request.state, 'payload'):
            return await call_next(request)

            
        now = datetime.now(timezone.utc)
        payload = request.state.payload
        exp = datetime.fromtimestamp(payload.get('exp'), tz=timezone.utc)
        iat = datetime.fromtimestamp(payload.get('iat'), tz=timezone.utc)
        is_remember = True if exp - iat == AuthJWT.remembered_token_exire else False

        response = await call_next(request)

        if now + AuthJWT.token_refresh_delta > exp:
            exp = now + (AuthJWT.remembered_token_exire if is_remember else AuthJWT.not_remembered_token_expire)
            jwt_payload = {
                "sub": payload.get('sub'),
                'exp': exp,
                "iat": now
            }
            token = encode_jwt(jwt_payload)
            response.set_cookie(
                key='access_token',
                value=str(token),
                path="/",
                httponly=True,
                expires=exp
            )

        return response


def add_middleware(app: FastAPI):
    app.add_middleware(CookieRefreshMiddleware)
    return app