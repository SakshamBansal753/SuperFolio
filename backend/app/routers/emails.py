import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.databse import get_db
from app.gmail_service import get_message, list_message_ids
from app.google_oauth import get_google_access_token
from app.ai_classifier import classify_email, extract_job_details
from app.models import Email, Application, BoardColumn
from app.schema import EmailLinkApplication, EmailOut
from app.redis_client import (
    get_user_cached_emails,
    set_user_cached_emails,
    invalidate_user_cached_emails,
)


async def auto_link_and_move_application(
    db: AsyncSession,
    user_id: str,
    email: Email,
    stage_label: str,
) -> None:
    """If an email is a legitimate job communication (not Promotional),
    extract company and role. Match or create an application in the appropriate
    Kanban column matching the stage label, and link it to the email."""
    if not stage_label or stage_label == "Promotional":
        return

    # Extract company & role
    details = extract_job_details(email.subject, email.body)
    company = details.get("company", "").strip()
    role = details.get("role", "").strip() or "Applicant"

    if not company:
        sender = email.sender or ""
        if "@" in sender:
            domain = sender.split("@")[-1].replace(">", "").strip()
            company = domain.split(".")[0].capitalize()
        else:
            company = sender[:30]

    # Find the target board column matching the stage label
    col_res = await db.execute(
        select(BoardColumn).where(
            BoardColumn.clerk_user_id == user_id,
            BoardColumn.name.ilike(stage_label),
        )
    )
    target_column = col_res.scalar_one_or_none()
    if not target_column:
        fallback_res = await db.execute(
            select(BoardColumn).where(
                BoardColumn.clerk_user_id == user_id,
                BoardColumn.name.ilike("Applied"),
            )
        )
        target_column = fallback_res.scalar_one_or_none()

    if not target_column:
        return

    # Check for existing application matching this company
    app_res = await db.execute(
        select(Application).where(
            Application.clerk_user_id == user_id,
            Application.company.ilike(f"%{company}%"),
        )
    )
    matched_app = app_res.scalar_one_or_none()

    if matched_app:
        matched_app.column_id = target_column.id
        email.application_id = matched_app.id
    else:
        # Auto-create the card on the Kanban board!
        pos_res = await db.execute(
            select(Application.position)
            .where(
                Application.clerk_user_id == user_id,
                Application.column_id == target_column.id,
            )
            .order_by(Application.position.desc())
            .limit(1)
        )
        last_pos = pos_res.scalar_one_or_none() or 0.0

        new_app = Application(
            clerk_user_id=user_id,
            column_id=target_column.id,
            position=last_pos + 1024.0,
            company=company,
            role=role,
            source="gmail",
            applied_date=email.received_at,
            notes=f"Auto-imported from: {email.subject[:100]}",
        )
        db.add(new_app)
        await db.flush()
        email.application_id = new_app.id



router = APIRouter(prefix="/emails", tags=["emails"])

# Tune this as the matching logic improves. Wide net for now — better to
# pull in some noise and let the user (or the AI classifier) filter, than
# to silently miss a real recruiter email.
DEFAULT_SYNC_QUERY = (
    'subject:(interview OR application OR offer OR position OR "thank you for applying") '
    "newer_than:60d"
)


@router.post("/sync", response_model=list[EmailOut])
async def sync_gmail(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    access_token = await get_google_access_token(user_id)
    message_ids = await list_message_ids(access_token, query=DEFAULT_SYNC_QUERY)

    result = await db.execute(
        select(Email.gmail_message_id).where(Email.clerk_user_id == user_id)
    )
    already_stored = {row[0] for row in result.all()}
    new_ids = [mid for mid in message_ids if mid not in already_stored]

    new_emails = []
    for message_id in new_ids:
        parsed = await get_message(access_token, message_id)
        # Auto-classify job application stage with Groq AI upon fetch
        stage_label = classify_email(parsed.get("subject", ""), parsed.get("body", ""))
        email = Email(clerk_user_id=user_id, classification=stage_label, **parsed)
        db.add(email)
        await auto_link_and_move_application(db, user_id, email, stage_label)
        new_emails.append(email)

    await db.commit()
    for email in new_emails:
        await db.refresh(email)

    # Invalidate Redis cache so subsequent reads pick up fresh data
    await invalidate_user_cached_emails(user_id)

    return new_emails


@router.post("/seed", response_model=list[EmailOut])
async def seed_sample_emails(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Dev/testing helper: populates sample recruiter emails so you can
    test UI rendering, AI stage classification, and card linking without
    needing Google Cloud OAuth configured."""
    samples = [
        {
            "gmail_message_id": f"seed-stripe-{uuid.uuid4().hex[:6]}",
            "sender": "recruiting@stripe.com",
            "subject": "Thank you for applying to Stripe - Software Engineer",
            "body": "Hi there,\n\nThank you for your interest in Stripe! We have received your application for the Backend Software Engineer position. Our engineering team is currently reviewing your application and portfolio.",
            "received_at": datetime.now(timezone.utc),
        },
        {
            "gmail_message_id": f"seed-google-{uuid.uuid4().hex[:6]}",
            "sender": "tech-recruiter@google.com",
            "subject": "Google Interview Invitation: Technical Phone Screen",
            "body": "Hello,\n\nWe were impressed with your technical background and would like to invite you for a 45-minute technical screen with one of our software engineers. Please reply with your availability for next week.",
            "received_at": datetime.now(timezone.utc),
        },
        {
            "gmail_message_id": f"seed-meta-{uuid.uuid4().hex[:6]}",
            "sender": "careers@meta.com",
            "subject": "Update on your application with Meta",
            "body": "Hi,\n\nThank you for taking the time to speak with our team. Although your skills are commendable, we have decided to move forward with other candidates whose experience more closely matches our immediate requirements at this time.",
            "received_at": datetime.now(timezone.utc),
        },
        {
            "gmail_message_id": f"seed-datadog-{uuid.uuid4().hex[:6]}",
            "sender": "talent@datadoghq.com",
            "subject": "Datadog - Initial Phone Screen Conversation",
            "body": "Hi!\n\nI came across your profile and think you'd be a great match for our engineering team. Do you have 15-20 minutes free this week for an initial intro call?",
            "received_at": datetime.now(timezone.utc),
        },
    ]

    new_emails = []
    for s in samples:
        # Auto-classify job application stage with Groq AI upon creation
        stage_label = classify_email(s["subject"], s["body"])
        email = Email(clerk_user_id=user_id, classification=stage_label, **s)
        db.add(email)
        await auto_link_and_move_application(db, user_id, email, stage_label)
        new_emails.append(email)

    await db.commit()
    for email in new_emails:
        await db.refresh(email)

    # Invalidate Redis cache
    await invalidate_user_cached_emails(user_id)

    return new_emails


@router.get("", response_model=list[EmailOut])
async def list_emails(
    auto_sync: bool = False,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    # Optional auto-fetch on sign-in: attempt background sync if requested
    if auto_sync:
        try:
            await sync_gmail(db=db, user_id=user_id)
        except Exception:
            # If Google OAuth isn't linked yet, rollback any failed transaction and continue serving emails
            await db.rollback()

    # Check user-specific Redis cache first
    cached_data = await get_user_cached_emails(user_id)
    if cached_data is not None and not auto_sync:
        return cached_data

    result = await db.execute(
        select(Email)
        .where(Email.clerk_user_id == user_id)
        .order_by(Email.received_at.desc())
    )
    emails = result.scalars().all()

    # Safely convert to Pydantic models without triggering lazy loading
    email_outs = [
        EmailOut(
            id=em.id,
            application_id=em.application_id,
            gmail_message_id=em.gmail_message_id,
            sender=em.sender,
            subject=em.subject,
            body=em.body,
            received_at=em.received_at,
            ai_reply_draft=em.ai_reply_draft,
            classification=em.classification or "Applied",
            created_at=em.created_at,
            updated_at=getattr(em, "updated_at", None) or em.created_at or em.received_at,
        )
        for em in emails
    ]

    # Store in Redis cache for this user (TTL 5 minutes)
    serialized = [e.model_dump(mode="json") for e in email_outs]
    await set_user_cached_emails(user_id, serialized, ttl=300)

    return email_outs


@router.patch("/{email_id}/link", response_model=EmailOut)
async def link_email_to_application(
    email_id: uuid.UUID,
    payload: EmailLinkApplication,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Email).where(Email.id == email_id, Email.clerk_user_id == user_id)
    )
    email = result.scalar_one_or_none()
    if email is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    email.application_id = payload.application_id
    await db.commit()
    await db.refresh(email)

    await invalidate_user_cached_emails(user_id)
    return email


@router.post("/{email_id}/classify")
async def classify_email_endpoint(
    email_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Classifies one stored email into a stage label and updates the DB & cache."""
    result = await db.execute(
        select(Email).where(Email.id == email_id, Email.clerk_user_id == user_id)
    )
    email = result.scalar_one_or_none()
    if email is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    label = classify_email(email.subject, email.body)
    email.classification = label
    await auto_link_and_move_application(db, user_id, email, label)
    await db.commit()
    await db.refresh(email)

    await invalidate_user_cached_emails(user_id)
    return {"email_id": email.id, "subject": email.subject, "classification": label}
