from typing import Annotated

from fastapi import APIRouter, Depends

from core.security import require
from database.relational_db import User
from domain.cars import CarImageUploadRequest, CarImageUploadResponse
from service.cars import CarService, get_car_service

router = APIRouter()


@router.post(
    path="/upload-presign",
    response_model=CarImageUploadResponse,
    summary="Create presigned URL for a car image upload (admin)",
)
async def create_car_image_upload(
    payload: CarImageUploadRequest,
    _: Annotated[User, Depends(require("admin"))],
    svc: Annotated[CarService, Depends(get_car_service)],
) -> CarImageUploadResponse:
    return await svc.create_image_upload(
        filename=payload.filename,
        content_type=payload.content_type,
    )
