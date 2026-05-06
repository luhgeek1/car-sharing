from fastapi import Depends

from core.config import get_settings
from database.relational_db import CarInterface, UoW, get_uow
from service.media import MediaStorageService, get_media_storage_service
from .car_service import CarService


async def get_car_service(
    uow: UoW = Depends(get_uow),
    media_storage: MediaStorageService = Depends(get_media_storage_service),
) -> CarService:
    return CarService(
        uow=uow,
        car_repo=CarInterface(uow.session),
        media_storage=media_storage,
        settings=get_settings(),
    )
