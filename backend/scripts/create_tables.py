import asyncio
 
from app.databse import Base, engine
from app.models import Application, BoardColumn, Email  # noqa: F401 — registers all models on Base.metadata
 
 
async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")
 
 
if __name__ == "__main__":
    asyncio.run(main())

 