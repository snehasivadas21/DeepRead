from fastapi import FastAPI
from app.api.auth import router as auth_router
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings

app = FastAPI(title="DeepRead API")
app.include_router(auth_router)

app.add_middleware(SessionMiddleware,secret_key=settings.JWT_SECRET_KEY,)
