"""utils"""
import jwt
from passlib.context import CryptContext
from typing import Union

from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def encode_jwt(
    payload: dict,
    private_key: str = str(settings.auth_jwt.private_key_path),
    algorithm: str = settings.auth_jwt.algorithm,
):
    with open(private_key, "r") as f:
        private_key = f.read()
    to_encode = payload.copy()

    encoded = jwt.encode(
        to_encode,
        private_key,
        algorithm
    )

    return encoded


def decode_jwt(
    token: str,
    public_key: str = str(settings.auth_jwt.public_key_path),
    algorithm: str = settings.auth_jwt.algorithm
):
    with open(public_key, "r") as f:
        public_key = f.read()
    decoded = jwt.decode(
        token,
        public_key,
        algorithm)

    return decoded


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)
