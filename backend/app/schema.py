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

