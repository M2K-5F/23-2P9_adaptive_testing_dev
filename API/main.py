"""main.py for API"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from controllers import add_routers_to_app as add_routers
from middlewares.cors import add_middleware as add_cors_middleware
from middlewares.refresh_cookie import add_middleware as add_refresh_cookie_middleware
from middlewares.auth import add_middleware as add_auth_middelware
from pathlib import Path


IS_DIST_EXIST = Path('../dist').is_dir()


app = FastAPI()

app = add_refresh_cookie_middleware(app)
app = add_auth_middelware(app)
app = add_cors_middleware(app)

app = add_routers(app)


if IS_DIST_EXIST:
    app.mount("/assets", StaticFiles(directory="../dist/assets"), name="assets")
    app.mount('/public', StaticFiles(directory='../public', html=False,), name='public')

    @app.get("/{full_path:path}")
    async def serve_spa():
        return FileResponse("../dist/index.html")



if __name__ == "__main__":
    uvicorn.run("main:app", host='0.0.0.0', reload=True, port=8001)