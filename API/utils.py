from datetime import datetime, timedelta

from cryptography.hazmat.primitives import serialization
import jwt
from passlib.context import CryptContext

from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def encode_jwt(
    payload: dict,
    private_key: str = settings.auth_jwt.private_key_path,
    algorithm: str = settings.auth_jwt.algorithm,
    expire_timedelta: timedelta | None = None,
    expire_munites: int = settings.auth_jwt.access_token_expire
):
    with open(private_key, "r") as f:
        private_key = f.read()
    to_encode = payload.copy()
    now = datetime.utcnow()
    if expire_timedelta:
        expire = now + expire_timedelta

    else:
        expire = now + timedelta(minutes=expire_munites)

    with private_key.open("rb") as key_file:
        key = serialization.load_pem_private_key(key_file.read(),
                                                 password=None)

    key = key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ).decode("utf-8")

    encoded = jwt.encode(
                    to_encode,
                    key,
                    algorithm)

    return encoded


def decode_jwt(
    token: str | bytes,
    public_key: str = settings.auth_jwt.public_key_path,
    algorithm: str = settings.auth_jwt.algorithm
):
    with open(public_key, "r") as f:
        public_key = f.read()
    decoded = jwt.decode(
        token,
        key,
        algorithm)

    return decoded


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)
