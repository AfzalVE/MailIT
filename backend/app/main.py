from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.logger import app_logger
from starlette.middleware.sessions import SessionMiddleware

# Routers

from app.modules.auth import router as auth_router
from app.modules.email import router as email_router
from app.modules.user import router as user_router
from app.modules.gmail import gmail_router

# Import models so SQLAlchemy registers them
from app.modules.user.user_model import User
from app.modules.email.email_model import Email


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)



# Session Middleware (Required for Google OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site="lax",
    https_only=False,      # Change to True after deploying with HTTPS
    max_age=60 * 60 * 24,  # 24 hours
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://reply-iq-three.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(auth_router)
app.include_router(email_router)
app.include_router(user_router)
app.include_router(gmail_router)


@app.on_event("startup")
def startup():
    app_logger.info(
        "Starting ReplyIQ Backend"
    )
    Base.metadata.create_all(
        bind=engine
    )



@app.get("/")
def root():
    return {
        "success": True,
        "application":settings.APP_NAME,
        "version":settings.APP_VERSION,
        "message":"ReplyIQ Backend Running Successfully",
    }



@app.get("/health")
def health():
    return {
        "status":"healthy"
    }