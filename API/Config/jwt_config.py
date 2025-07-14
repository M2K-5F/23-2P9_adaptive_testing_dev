from pathlib import Path
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from fastapi.security import OAuth2PasswordBearer

BASE_DIR = Path(__file__).parent.parent

class AuthJWT(BaseModel):
    """jwt token authentification"""

    private_key_path: Path = BASE_DIR / "certs" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certs" / "jwt-public.pem"
    algorithm: str = "ES256"
    access_token_expire: int = 15


class Settings(BaseSettings):
    auth_jwt: AuthJWT = AuthJWT()


settings = Settings()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login", 
    auto_error=False
)