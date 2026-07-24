import uuid
from datetime import datetime
 
from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.databse import Base

class Application(Base):
    __tablename__="applications"
    id:Mapped[uuid.UUID]=mapped_column(
        UUID(as_uuid=True),primary_key=True,default=uuid.uuid4
    )
    clerk_user_id:Mapped[str]=mapped_column(String,index=True,nullable=False)
    column_id:Mapped[uuid.UUID]=mapped_column(
        UUID(as_uuid=True),
        ForeignKey("board_columns.id",ondelete="RESTRICT"),
        index=True,
        nullable=False
    )
    position:Mapped[float]=mapped_column(nullable=False)
    company:Mapped[str]=mapped_column(String(200),nullable=False)
    role:Mapped[str]=mapped_column(String(200),nullable=False)
    
    job_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
 
    # "manual" (user-created) or "gmail" (created by future inbox sync).
    source: Mapped[str] = mapped_column(String(20), default="manual", nullable=False)
 
    applied_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
