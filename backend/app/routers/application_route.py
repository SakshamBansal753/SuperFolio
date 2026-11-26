import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.databse import get_db
from app.models import Application as ApplicationModel, Email as EmailModel
from app.schema import ApplicationCreate, ApplicationMove, ApplicationUpdate
from app.schema import Application as ApplicationSchema

router = APIRouter(prefix="/application", tags=["application"])


@router.get("", response_model=list[ApplicationSchema])
async def list_applications(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    result = await db.execute(
        select(ApplicationModel)
        .where(ApplicationModel.clerk_user_id == user_id)
        .order_by(ApplicationModel.column_id, ApplicationModel.position)
    )
    apps = result.scalars().all()

    # Fetch emails for this user to attach linked email details
    email_result = await db.execute(
        select(EmailModel)
        .where(EmailModel.clerk_user_id == user_id)
        .order_by(EmailModel.received_at.desc())
    )
    emails = email_result.scalars().all()

    # Map by application_id and company matching
    app_email_map: dict[uuid.UUID, EmailModel] = {}
    for em in emails:
        if em.application_id and em.application_id not in app_email_map:
            app_email_map[em.application_id] = em

    for em in emails:
        comp_search = (em.subject or "") + " " + (em.sender or "")
        for app in apps:
            if app.id not in app_email_map and app.company.lower() in comp_search.lower():
                app_email_map[app.id] = em

    enriched = []
    for app in apps:
        em = app_email_map.get(app.id)
        enriched.append(
            ApplicationSchema(
                id=app.id,
                column_id=app.column_id,
                position=app.position,
                company=app.company,
                role=app.role,
                job_url=app.job_url,
                notes=app.notes,
                source=app.source,
                applied_date=app.applied_date,
                created_at=app.created_at,
                updated_at=app.updated_at,
                email_id=em.id if em else None,
                gmail_message_id=em.gmail_message_id if em else None,
                email_sender=em.sender if em else None,
                email_subject=em.subject if em else None,
                email_body=em.body if em else None,
            )
        )
    return enriched


@router.post("", response_model=ApplicationSchema, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    result = await db.execute(
        select(ApplicationModel.position)
        .where(
            ApplicationModel.clerk_user_id == user_id,
            ApplicationModel.column_id == payload.column_id,
        )
        .order_by(ApplicationModel.position.desc())
        .limit(1)
    )
    last_position = result.scalar_one_or_none() or 0.0

    application = ApplicationModel(
        clerk_user_id=user_id, position=last_position + 1024, **payload.model_dump()
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def _get_owned_application(
    application_id: uuid.UUID, db: AsyncSession, user_id: str
) -> ApplicationModel:
    result = await db.execute(
        select(ApplicationModel).where(
            ApplicationModel.id == application_id, ApplicationModel.clerk_user_id == user_id
        )
    )
    application = result.scalar_one_or_none()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


@router.patch("/{application_id}", response_model=ApplicationSchema)
async def update_application(
    application_id: uuid.UUID,
    payload: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    application = await _get_owned_application(application_id, db, user_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    await db.commit()
    await db.refresh(application)
    return application


@router.patch("/{application_id}/move", response_model=ApplicationSchema)
async def move_application(
    application_id: uuid.UUID,
    payload: ApplicationMove,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    application = await _get_owned_application(application_id, db, user_id)
    application.column_id = payload.column_id
    application.position = payload.position
    await db.commit()
    await db.refresh(application)
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    application = await _get_owned_application(application_id, db, user_id)
    await db.delete(application)
    await db.commit()