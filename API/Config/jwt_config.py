from pathlib import Path
from fastapi.security import OAuth2PasswordBearer

BASE_DIR = Path(__file__).parent.parent


class AuthJWT():
    private_key_path: Path = BASE_DIR / "certs" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certs" / "jwt-public.pem"
    algorithm: str = "ES256"
    access_token_expire: int = 15


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)
