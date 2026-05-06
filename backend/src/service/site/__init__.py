from fastapi import Depends

from database.relational_db import (
    ContactRequestInterface,
    ServiceInterface,
    SiteContentInterface,
    UoW,
    get_uow,
)
from service.notifications import NotificationService, get_notification_service

from .site_service import SiteService


async def get_site_service(
    uow: UoW = Depends(get_uow),
    notification_service: NotificationService = Depends(get_notification_service),
) -> SiteService:
    return SiteService(
        uow=uow,
        service_repo=ServiceInterface(uow.session),
        site_content_repo=SiteContentInterface(uow.session),
        contact_request_repo=ContactRequestInterface(uow.session),
        notification_service=notification_service,
    )
