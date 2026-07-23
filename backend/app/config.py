import os
 
from dotenv import load_dotenv
 
load_dotenv()  # reads .env and loads its keys into os.environ
 
DATABASE_URL = os.getenv("DATABASE_URL")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS_LIST = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]
 
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing — check your .env file")
 
if not CLERK_ISSUER:
    raise RuntimeError("CLERK_ISSUER is missing — check your .env file")