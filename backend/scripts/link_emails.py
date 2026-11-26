import asyncio
import sys

sys.path.insert(0, ".")
from app.databse import engine
from sqlalchemy import text

async def link():
    async with engine.begin() as conn:
        apps = await conn.execute(text("SELECT id, company, clerk_user_id FROM applications;"))
        app_list = apps.fetchall()
        for a_id, comp, u_id in app_list:
            res = await conn.execute(
                text("UPDATE emails SET application_id = :a_id WHERE clerk_user_id = :u_id AND (subject ILIKE :pat OR body ILIKE :pat OR sender ILIKE :pat);"),
                {"a_id": a_id, "u_id": u_id, "pat": f"%{comp}%"}
            )
            print(f"Updated {res.rowcount} emails for {comp} ({u_id[:10]}...)")
        print("Done linking!")

asyncio.run(link())
