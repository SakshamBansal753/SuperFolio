from fastapi import APIRouter,Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import BoardColumn,DEFAULT_COLUMNS
from app.schema import Column
from app.databse import get_db
from app.auth import get_current_user_id
router=APIRouter(prefix='/columns',tags=['columns'])
@router.get("",response_model=list[Column])
async def list_columns(
    db:AsyncSession=Depends(get_db),
    user_id:str=Depends(get_current_user_id)):
    result=await db.execute(
        select(BoardColumn)
        .where(BoardColumn.clerk_user_id==user_id)
        .order_by(BoardColumn.position)
    )
    columns=result.scalars().all()
    if not columns:
        columns=[
            BoardColumn(
                clerk_user_id=user_id,
                name=col["name"],
                color=col['color'],
                position=float(i*1024),
            )
            for i,col in enumerate(DEFAULT_COLUMNS)
        ]
        db.add_all(columns)
        await db.commit()
        for col in columns:
            await db.refresh(col)

    return columns
    