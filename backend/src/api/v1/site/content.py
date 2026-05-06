from typing import Annotated

from fastapi import APIRouter, Depends

from domain.site import SiteContentModel
from service.site import SiteService, get_site_service

router = APIRouter()


@router.get(
    path="/content",
    response_model=SiteContentModel,
    summary="Get site content (public)",
)
async def get_site_content(
    svc: Annotated[SiteService, Depends(get_site_service)],
) -> SiteContentModel:
    return SiteContentModel.model_validate(await svc.get_site_content())
