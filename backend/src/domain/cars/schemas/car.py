from decimal import Decimal
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from domain.cars.enums import CarCategory
from domain.common import TimestampModel


PricePerDay = Annotated[Decimal, Field(ge=0, max_digits=10, decimal_places=2)]


class CarBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    brand: str = Field(..., min_length=1, max_length=80)
    model: str = Field(..., min_length=1, max_length=120)
    year: int = Field(..., ge=1900, le=2100)
    category: CarCategory = CarCategory.LUXURY
    description: str = Field("", max_length=4000)
    images: list[HttpUrl] = Field(default_factory=list, max_length=12)
    price_per_day: PricePerDay
    highlights: list[str] = Field(default_factory=list)
    is_available: bool = True


class CarCreate(CarBase):
    pass


class CarUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=160)
    brand: str | None = Field(None, min_length=1, max_length=80)
    model: str | None = Field(None, min_length=1, max_length=120)
    year: int | None = Field(None, ge=1900, le=2100)
    category: CarCategory | None = None
    description: str | None = Field(None, max_length=4000)
    images: list[HttpUrl] | None = Field(None, max_length=12)
    price_per_day: PricePerDay | None = None
    highlights: list[str] | None = None
    is_available: bool | None = None


class CarModel(TimestampModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    brand: str
    model: str
    year: int
    category: CarCategory
    description: str
    images: list[str] = Field(default_factory=list)
    price_per_day: Decimal
    highlights: list[str]
    is_available: bool


class CarImageUploadRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., min_length=1, max_length=128)


class CarImageUploadResponse(BaseModel):
    object_key: str
    upload_url: str
    public_url: str
    expires_in: int
