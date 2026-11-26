from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import ALLOWED_ORIGINS_LIST
from app.routers import Columns, emails, application_route

app = FastAPI(title="JobPilot")

origins = list(
    set(
        ALLOWED_ORIGINS_LIST
        + [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(Columns.router)
app.include_router(emails.router)
app.include_router(application_route.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "JobPilot backend is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
