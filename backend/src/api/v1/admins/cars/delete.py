from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, Response, status

from core.security import require
from database.relational_db import User
from service.cars import CarService, get_car_service

router = APIRouter()


@router.delete(
    path="/{car_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a car (admin)",
)
async def delete_car(
    car_id: Annotated[UUID, Path(...)],
    _: Annotated[User, Depends(require("admin"))],
    svc: Annotated[CarService, Depends(get_car_service)],
):
    await svc.delete_car(car_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
