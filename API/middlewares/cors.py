from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


def add_middleware(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", 'http://localhost:8001', 'http://localhost:80'],
        allow_credentials=True, 
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app