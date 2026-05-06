from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from core.security import require
from database.relational_db import User
from domain.site import ContactRequestModel
from service.site import SiteService, get_site_service

router = APIRouter()


class ContactRequestListResponse(BaseModel):
    items: list[ContactRequestModel]
    next_cursor: str | None
    total: int


@router.get(
    path="/",
    response_model=ContactRequestListResponse,
    summary="List contact requests (admin, cursor pagination)",
)
async def list_contact_requests(
    _: Annotated[User, Depends(require("admin"))],
    svc: Annotated[SiteService, Depends(get_site_service)],
    service_slug: str | None = Query(None, description="Filter by service slug"),
    search: str | None = Query(None, description="Search by name/email/phone/vehicle"),
    limit: int = Query(50, ge=1, le=100, description="Page size"),
    cursor: str | None = Query(None, description="Opaque cursor"),
) -> ContactRequestListResponse:
    items, next_cursor, total = await svc.admin_list_contact_requests(
        service_slug=service_slug,
        search=search,
        limit=limit,
        cursor=cursor,
    )
    return ContactRequestListResponse(
        items=[ContactRequestModel.model_validate(item) for item in items],
        next_cursor=next_cursor,
        total=total,
    )
