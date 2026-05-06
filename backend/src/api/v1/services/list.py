from typing import Annotated

from fastapi import APIRouter, Depends

from domain.site import ServiceModel
from service.site import SiteService, get_site_service

router = APIRouter()


@router.get(
    path="/",
    response_model=list[ServiceModel],
    summary="List services (public)",
)
async def list_services(
    svc: Annotated[SiteService, Depends(get_site_service)],
) -> list[ServiceModel]:
    services = await svc.list_services()
    return [ServiceModel.model_validate(service) for service in services]
