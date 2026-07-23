import asyncio
 
from app.databse import Base, engine
from app.models import BoardColumn  # noqa: F401 — import registers the model on Base.metadata
 
 
async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")
 
 
if __name__ == "__main__":
    asyncio.run(main())
 