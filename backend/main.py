from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.config import settings
from backend.database import connect_to_mongo, close_mongo_connection
from backend.routes import auth, notes, users, corporation, files

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"]
)
app.include_router(
    notes.router, prefix=f"{settings.API_V1_STR}/notes", tags=["notes"]
)
app.include_router(
    users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"]
)
app.include_router(
    corporation.router, prefix=f"{settings.API_V1_STR}/corporation", tags=["corporation"]
)
app.include_router(
    files.router, prefix=f"{settings.API_V1_STR}/files", tags=["files"]
)

@app.get("/")
async def root():
    return {
        "message": "Bem-vindo ao NeuraNote API",
        "version": settings.PROJECT_VERSION,
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
