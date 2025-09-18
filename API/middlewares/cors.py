from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from config.path_config import ALLOWED_ORIGINS


def add_middleware(app: FastAPI):
    """Configured CORS middleware"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True, 
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app