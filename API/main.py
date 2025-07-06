"""main.py for API"""
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from vievs import add_routers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

add_routers(app)


if __name__ == "__main__":
    uvicorn.run("main:app", host='0.0.0.0', reload=True, port=8001)
