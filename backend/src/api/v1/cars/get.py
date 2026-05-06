from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path

from domain.cars import CarModel
from service.cars import CarService, get_car_service

router = APIRouter()


@router.get(
    path="/{car_id}",
    response_model=CarModel,
    summary="Get car by id (public)",
)
async def get_car(
    car_id: Annotated[UUID, Path(...)],
    svc: Annotated[CarService, Depends(get_car_service)],
):
    car = await svc.get_car(car_id)
    return car
