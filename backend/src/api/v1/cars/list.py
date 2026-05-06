from typing import Annotated
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from domain.cars import CarModel
from domain.cars.enums import CarCategory
from service.cars import CarService, get_car_service

router = APIRouter()


class CarListResponse(BaseModel):
    items: list[CarModel]
    total: int


@router.get(
    path="/",
    response_model=CarListResponse,
    summary="List cars (public)",
)
async def list_cars(
    svc: Annotated[CarService, Depends(get_car_service)],
    category: CarCategory | None = Query(None),
    is_available: bool | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    items, total = await svc.list_cars(
        category=category.value if category else None,
        is_available=is_available,
        limit=limit,
        offset=offset,
    )
    return CarListResponse(
        items=[CarModel.model_validate(item) for item in items],
        total=total,
    )
