import os
 
from dotenv import load_dotenv
 
load_dotenv()  # reads .env and loads its keys into os.environ
 
DATABASE_URL = os.getenv("DATABASE_URL")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
ALLOWED_ORIGINS_LIST = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
 
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing — check your .env file")
 
if not CLERK_ISSUER:
    raise RuntimeError("CLERK_ISSUER is missing — check your .env file")