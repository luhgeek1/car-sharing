from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from domain.common import TimestampModel


class ContactRequestCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=160)
    phone: str = Field(..., min_length=6, max_length=64)
    email: EmailStr
    service_slug: str | None = Field(None, min_length=1, max_length=64)
    service_label: str = Field(..., min_length=1, max_length=160)
    vehicle_type: str = Field(..., min_length=2, max_length=160)
    preferred_date: date
    message: str = Field("", max_length=4000)


class ContactRequestModel(TimestampModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    phone: str
    email: EmailStr
    service_slug: str | None
    service_label: str
    vehicle_type: str
    preferred_date: date
    message: str
