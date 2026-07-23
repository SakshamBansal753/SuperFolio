from fastapi import APIRouter,Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import BoardColumn
from app.schema import Column
from app.databse import get_db
router=APIRouter(prefix='/columns',tags=['columns'])
@router.get("",response_model=list[Column])
async def list_columns(
    db:AsyncSession=Depends(get_db),
    user_id:str=Depends()):
    result=await db.execute(
        select(BoardColumn)
        .where(BoardColumn.clerk_user_id==user_id)
        .order_by(BoardColumn.position)
    )
    return result.scalars().all()
    