"""main.py for API"""
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from shared import shared_router
from student import student_router
from teacher import teacher_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shared_router)
app.include_router(student_router)
app.include_router(teacher_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host='0.0.0.0', reload=True, port=8001)
