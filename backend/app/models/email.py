import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

 
from app.databse import Base


class Email(Base):
    __tablename__ = "emails"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    clerk_user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)

    # Nullable — an email might arrive before it's matched to a specific
    # application (or never gets matched at all). SET NULL, not RESTRICT:
    # deleting a card shouldn't be blocked by an email still referencing it,
    # it should just become unlinked.
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    # Gmail's own message id. Unique so re-syncing the inbox never creates
    # duplicate rows for the same email.
    gmail_message_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    sender: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Where the AI's generated reply lives, pending the user's review — never
    # sent automatically. Null until a reply's actually been generated.
    ai_reply_draft: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )