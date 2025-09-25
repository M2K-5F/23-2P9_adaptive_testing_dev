from datetime import timedelta
from pathlib import Path
from fastapi.security import OAuth2PasswordBearer

BASE_DIR = Path(__file__).parent.parent


class AuthJWT():
    private_key_path: Path = BASE_DIR / "certs" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certs" / "jwt-public.pem"
    algorithm: str = "ES256"
    not_remembered_token_expire: timedelta = timedelta(minutes=15)
    remembered_token_exire: timedelta = timedelta(days=30)
    token_refresh_delta: timedelta = timedelta(minutes=3)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)
