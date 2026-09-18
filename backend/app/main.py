from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.workspaces import router as workspace_router
from app.api.sources import router as source_router
from app.api.search import router as search_router
from app.api.rag import router as rag_router
from app.api.conversations import router as conversations_router
from app.api.messages import router as messages_router

from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings

app = FastAPI(title="DeepRead API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.JWT_SECRET_KEY,
)

app.include_router(auth_router)
app.include_router(workspace_router)
app.include_router(source_router)
app.include_router(search_router)
app.include_router(rag_router)
app.include_router(conversations_router)
app.include_router(messages_router)

