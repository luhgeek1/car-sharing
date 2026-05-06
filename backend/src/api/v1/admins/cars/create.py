from typing import Annotated
from fastapi import APIRouter, Depends, status

from core.security import require
from database.relational_db import User
from domain.cars import CarCreate, CarModel
from service.cars import CarService, get_car_service

router = APIRouter()


@router.post(
    path="/",
    response_model=CarModel,
    status_code=status.HTTP_201_CREATED,
    summary="Create a car (admin)",
)
async def create_car(
    payload: CarCreate,
    _: Annotated[User, Depends(require("admin"))],
    svc: Annotated[CarService, Depends(get_car_service)],
):
    car = await svc.create_car(payload)
    return car
