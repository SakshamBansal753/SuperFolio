import asyncio
import sys
import uuid
from datetime import datetime, timezone

sys.path.insert(0, ".")
from app.databse import engine
from sqlalchemy import text

async def sync():
    async with engine.begin() as conn:
        # Check users
        users_res = await conn.execute(text("SELECT DISTINCT clerk_user_id FROM board_columns;"))
        user_ids = [r[0] for r in users_res.fetchall()]
        print("Found board users:", user_ids)

        source_user = "user_3GxgQc1TTzNOOk5r9G611BgOU2v"
        target_user = "user_3GsAcqL0YQz5uuahLTAn7YBtAEx"

        # Check target user columns
        target_cols_res = await conn.execute(
            text("SELECT id, name FROM board_columns WHERE clerk_user_id = :uid;"),
            {"uid": target_user}
        )
        target_cols = {r[1]: r[0] for r in target_cols_res.fetchall()}
        print("Target user columns:", target_cols)

        # Check if target user has applications
        apps_res = await conn.execute(
            text("SELECT COUNT(*) FROM applications WHERE clerk_user_id = :uid;"),
            {"uid": target_user}
        )
        app_count = apps_res.scalar()
        print(f"Target user app count: {app_count}")

        if app_count == 0 and target_cols:
            # Copy applications from source to target
            src_apps = await conn.execute(
                text("SELECT company, role, source, notes, column_id FROM applications WHERE clerk_user_id = :uid;"),
                {"uid": source_user}
            )
            # Find column names of src apps
            src_cols_res = await conn.execute(
                text("SELECT id, name FROM board_columns WHERE clerk_user_id = :uid;"),
                {"uid": source_user}
            )
            src_col_id_to_name = {r[0]: r[1] for r in src_cols_res.fetchall()}

            pos = 1024.0
            for app in src_apps.fetchall():
                company, role, src, notes, src_col_id = app
                col_name = src_col_id_to_name.get(src_col_id, "Applied")
                target_col_id = target_cols.get(col_name)
                if target_col_id:
                    new_app_id = uuid.uuid4()
                    await conn.execute(
                        text("""
                            INSERT INTO applications (id, clerk_user_id, column_id, position, company, role, source, notes, created_at, updated_at)
                            VALUES (:id, :uid, :col_id, :pos, :company, :role, :source, :notes, :created_at, :updated_at);
                        """),
                        {
                            "id": new_app_id,
                            "uid": target_user,
                            "col_id": target_col_id,
                            "pos": pos,
                            "company": company,
                            "role": role,
                            "source": src,
                            "notes": notes,
                            "created_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc),
                        }
                    )
                    pos += 1024.0
            print("Copied applications to target user!")

        # Check emails count for target user
        emails_res = await conn.execute(
            text("SELECT COUNT(*) FROM emails WHERE clerk_user_id = :uid;"),
            {"uid": target_user}
        )
        email_count = emails_res.scalar()
        print(f"Target user email count: {email_count}")

        if email_count == 0:
            src_emails = await conn.execute(
                text("""
                    SELECT gmail_message_id, sender, subject, body, received_at, ai_reply_draft, classification
                    FROM emails WHERE clerk_user_id = :uid;
                """),
                {"uid": source_user}
            )
            for em in src_emails.fetchall():
                gmid, sender, subject, body, rec_at, draft, cls = em
                new_em_id = uuid.uuid4()
                await conn.execute(
                    text("""
                        INSERT INTO emails (id, clerk_user_id, gmail_message_id, sender, subject, body, received_at, ai_reply_draft, classification, created_at, updated_at)
                        VALUES (:id, :uid, :gmid, :sender, :subject, :body, :received_at, :draft, :cls, :created_at, :updated_at);
                    """),
                    {
                        "id": new_em_id,
                        "uid": target_user,
                        "gmid": f"{gmid}-{target_user[:6]}",
                        "sender": sender,
                        "subject": subject,
                        "body": body,
                        "received_at": rec_at,
                        "draft": draft,
                        "cls": cls,
                        "created_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc),
                    }
                )
            print("Copied emails to target user!")

asyncio.run(sync())
