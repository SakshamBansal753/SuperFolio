import uuid
from datetime import datetime
 
from pydantic import BaseModel, ConfigDict

## Column:
class ColumnCreate(BaseModel):
    name:str
    color:str|None=None

class ColumnUpdate(BaseModel):
    name:str|None=None
    color:str|None=None

class ColumnReorder(BaseModel):
    position:float

class Column(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:uuid.UUID
    name:str
    position:float
    color:str|None
    created_at:datetime
    updated_at:datetime

## User

class ApplicationCreate(BaseModel):
    column_id: uuid.UUID
    company: str
    role: str
    job_url: str | None = None
    notes: str | None = None
    applied_date: datetime | None = None
 
 
class ApplicationUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    job_url: str | None = None
    notes: str | None = None
    applied_date: datetime | None = None
 
 
class ApplicationMove(BaseModel):
    # Sent on drag-drop: which column it landed in, and the midpoint
    # position between the two cards it landed between.
    column_id: uuid.UUID
    position: float
 
 
class Application(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    id: uuid.UUID
    column_id: uuid.UUID
    position: float
    company: str
    role: str
    job_url: str | None
    notes: str | None
    source: str
    applied_date: datetime | None
    created_at: datetime
    updated_at: datetime
class EmailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    id: uuid.UUID
    application_id: uuid.UUID | None
    gmail_message_id: str
    sender: str
    subject: str
    body: str
    received_at: datetime
    ai_reply_draft: str | None
    created_at: datetime
    updated_at: datetime
 
 
class EmailLinkApplication(BaseModel):
    # Manually correct/set which card this email belongs to, for when
    # automatic matching gets it wrong or leaves it unlinked.
    application_id: uuid.UUID | None
 
 
class GenerateReplyRequest(BaseModel):
    # Optional steer for the AI — e.g. "politely decline" or "ask about salary".
    instructions: str | None = None
 
 
class GenerateReplyResponse(BaseModel):
    ai_reply_draft: str