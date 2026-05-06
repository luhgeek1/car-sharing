import asyncio
from pathlib import Path
from urllib.parse import unquote, urlparse
from uuid import UUID, uuid4

from core.config import Settings
from database.relational_db import Car, CarInterface, UoW
from domain.cars import CarCreate, CarImageUploadResponse, CarUpdate
from service.media import (
    ALLOWED_AVATAR_CONTENT_TYPES,
    MediaStorageService,
)
from .exceptions import (
    CarImageObjectNotFoundError,
    CarImageTooLargeError,
    CarNotFoundError,
    UnsupportedCarImageContentTypeError,
)


_CAR_IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class CarService:
    def __init__(
        self,
        uow: UoW,
        car_repo: CarInterface,
        media_storage: MediaStorageService,
        settings: Settings,
    ):
        self.uow = uow
        self.car_repo = car_repo
        self.media_storage = media_storage
        self.settings = settings

    async def list_cars(
        self,
        *,
        category: str | None = None,
        is_available: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Car], int]:
        items = await self.car_repo.list(
            category=category,
            is_available=is_available,
            limit=limit,
            offset=offset,
        )
        total = await self.car_repo.count(
            category=category, is_available=is_available
        )
        return items, total

    async def get_car(self, car_id: UUID) -> Car:
        car = await self.car_repo.get_by_id(car_id)
        if car is None:
            raise CarNotFoundError()
        return car

    async def create_car(self, payload: CarCreate) -> Car:
        data = payload.model_dump()
        data["images"] = [str(url) for url in (data.get("images") or [])]
        await self._verify_stored_images(data["images"])
        car = Car(**data)
        await self.car_repo.add(car)
        await self.uow.commit()
        await self.uow.session.refresh(car)
        return car

    async def update_car(self, car_id: UUID, payload: CarUpdate) -> Car:
        car = await self.get_car(car_id)
        data = payload.model_dump(exclude_unset=True)
        if "images" in data and data["images"] is not None:
            data["images"] = [str(url) for url in data["images"]]
            await self._verify_stored_images(data["images"])
        for field, value in data.items():
            setattr(car, field, value)
        await self.uow.commit()
        await self.uow.session.refresh(car)
        return car

    async def delete_car(self, car_id: UUID) -> None:
        car = await self.get_car(car_id)
        await self.car_repo.delete(car)
        await self.uow.commit()

    async def create_image_upload(
        self,
        *,
        filename: str,
        content_type: str,
    ) -> CarImageUploadResponse:
        if content_type not in ALLOWED_AVATAR_CONTENT_TYPES:
            raise UnsupportedCarImageContentTypeError(
                list(ALLOWED_AVATAR_CONTENT_TYPES)
            )

        ext = Path(filename).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
            ext = _CAR_IMAGE_EXTENSIONS.get(content_type, ".jpg")

        object_key = f"cars/{uuid4().hex}{ext}"
        upload_url = self.media_storage.create_presigned_upload_url(
            bucket=self.settings.STORAGE_PUBLIC_BUCKET,
            key=object_key,
            content_type=content_type,
            expires_in=self.settings.STORAGE_PRESIGN_EXPIRES_SEC,
        )
        public_url = self.media_storage.build_public_url(
            bucket=self.settings.STORAGE_PUBLIC_BUCKET,
            key=object_key,
        )
        return CarImageUploadResponse(
            object_key=object_key,
            upload_url=upload_url,
            public_url=public_url,
            expires_in=self.settings.STORAGE_PRESIGN_EXPIRES_SEC,
        )

    def _public_storage_key_from_url(self, image_url: str) -> str | None:
        endpoint = urlparse(self.settings.STORAGE_ENDPOINT_PUBLIC.rstrip("/"))
        image = urlparse(image_url)
        if image.scheme != endpoint.scheme or image.netloc != endpoint.netloc:
            return None

        expected_prefix = f"/{self.settings.STORAGE_PUBLIC_BUCKET}/"
        if not image.path.startswith(expected_prefix):
            return None

        return unquote(image.path[len(expected_prefix):])

    async def _verify_stored_images(self, image_urls: list[str]) -> None:
        checked_keys: set[str] = set()
        for image_url in image_urls:
            object_key = self._public_storage_key_from_url(image_url)
            if object_key is None or object_key in checked_keys:
                continue

            checked_keys.add(object_key)
            stat = await asyncio.to_thread(
                lambda: self.media_storage.get_object_stat(
                    bucket=self.settings.STORAGE_PUBLIC_BUCKET,
                    key=object_key,
                ),
            )
            if stat is None:
                raise CarImageObjectNotFoundError()

            if stat.content_type not in ALLOWED_AVATAR_CONTENT_TYPES:
                raise UnsupportedCarImageContentTypeError(
                    list(ALLOWED_AVATAR_CONTENT_TYPES)
                )

            max_size_bytes = self.settings.MAX_PHOTO_SIZE * 1024 * 1024
            if stat.size_bytes > max_size_bytes:
                raise CarImageTooLargeError(self.settings.MAX_PHOTO_SIZE)
