"""main.py for API"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from shared import shared_router
from student import student_router
from teacher import teacher_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 'http://localhost:8001', 'http://localhost:80'],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shared_router)
app.include_router(student_router)
app.include_router(teacher_router)


app.mount("/assets", StaticFiles(directory="../dist/assets"), name="assets")
app.mount('/public', StaticFiles(directory='../public', html=False,), name='public')

@app.get("/{full_path:path}")
async def serve_spa():
    return FileResponse("../dist/index.html")



if __name__ == "__main__":
    uvicorn.run("main:app", host='0.0.0.0', reload=True, port=8001)