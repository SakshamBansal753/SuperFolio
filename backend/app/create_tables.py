"""Creates all tables directly from the SQLAlchemy models.

Fine for early development. Once the schema needs to evolve without wiping
data, switch to Alembic migrations instead.

Run with: python -m scripts.create_tables
"""

import asyncio

from app.databse import Base, engine
from app.models import Application, BoardColumn, Email  # noqa: F401 — import registers each model on Base.metadata


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")


if __name__ == "__main__":
    asyncio.run(main())