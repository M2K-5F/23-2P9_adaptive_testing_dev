"""main.py for API"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from controllers import main_router
from middlewares.cors import add_middleware as add_cors_middleware
from middlewares.refresh_cookie import add_middleware as add_refresh_cookie_middleware
from middlewares.auth import add_middleware as add_auth_middelware
from middlewares.serve import add_middleware as add_serve_middleware
from pathlib import Path


IS_DIST_EXIST = Path('../dist').is_dir()


app = FastAPI()

add_refresh_cookie_middleware(app)
add_auth_middelware(app)
add_serve_middleware(app)
add_cors_middleware(app)

app.include_router(main_router)


if IS_DIST_EXIST:
    app.mount("/assets", StaticFiles(directory="../dist/assets"), name="assets")


if __name__ == "__main__":
    uvicorn.run("main:app", host='0.0.0.0', reload=True, port=80)