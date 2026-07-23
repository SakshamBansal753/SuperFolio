import uuid
from datetime import datetime
from sqlalchemy import DateTime,ForeignKey,String,Text,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
 
from app.databse import Base

class BoardColumn(Base):
    __tablename__="board_columns"
    id:Mapped[uuid.UUID]=mapped_column(
        UUID(as_uuid=True),primary_key=True,default=uuid.uuid4
    )
    clerk_user_id:Mapped[str]=mapped_column(String,index=True,nullable=False)
    name:Mapped[str]=mapped_column(String(100),nullable=False)
    position:Mapped[float]=mapped_column(nullable=False)
    color:Mapped[str]=mapped_column(String(20),nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )    
DEFAULT_COLUMNS = [
    {"name": "Applied", "color": "#9AA3AF"},
    {"name": "Screening", "color": "#9AA3AF"},
    {"name": "Interview", "color": "#E2A63B"},
    {"name": "Offer", "color": "#4FAE82"},
    {"name": "Rejected", "color": "#B85C5C"},
]