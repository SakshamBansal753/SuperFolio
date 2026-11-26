import asyncio
import sys
sys.path.insert(0, ".")
from app.databse import engine
from sqlalchemy import text

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT id, subject, sender, classification, clerk_user_id FROM emails;"))
        rows = res.fetchall()
        print(f"Total emails: {len(rows)}")
        for r in rows:
            print(f"[{r[3]}] {r[1]} ({r[2]}) -> user {r[4]}")

asyncio.run(check())
