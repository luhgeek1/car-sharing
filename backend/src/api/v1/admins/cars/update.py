from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path

from core.security import require
from database.relational_db import User
from domain.cars import CarModel, CarUpdate
from service.cars import CarService, get_car_service

router = APIRouter()


@router.patch(
    path="/{car_id}",
    response_model=CarModel,
    summary="Update a car (admin)",
)
async def update_car(
    car_id: Annotated[UUID, Path(...)],
    payload: CarUpdate,
    _: Annotated[User, Depends(require("admin"))],
    svc: Annotated[CarService, Depends(get_car_service)],
):
    car = await svc.update_car(car_id, payload)
    return car
