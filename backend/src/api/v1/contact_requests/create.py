from typing import Annotated

from fastapi import APIRouter, Depends, status

from core.rate_limit import (
    CONTACT_LIMITER_STATE_KEY,
    build_rate_dependency,
    public_client_identifier,
)
from domain.site import ContactRequestCreate, ContactRequestModel
from service.site import SiteService, get_site_service

router = APIRouter()
contact_rate_limit = build_rate_dependency(
    CONTACT_LIMITER_STATE_KEY,
    identifier=public_client_identifier,
)


@router.post(
    path="/",
    response_model=ContactRequestModel,
    status_code=status.HTTP_201_CREATED,
    summary="Create contact request (public)",
    dependencies=[Depends(contact_rate_limit)],
)
async def create_contact_request(
    payload: ContactRequestCreate,
    svc: Annotated[SiteService, Depends(get_site_service)],
) -> ContactRequestModel:
    contact_request = await svc.create_contact_request(payload)
    return ContactRequestModel.model_validate(contact_request)
