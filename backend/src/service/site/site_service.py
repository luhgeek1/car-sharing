from datetime import datetime
from uuid import UUID

from database.relational_db import (
    ContactRequest,
    ContactRequestInterface,
    Service,
    ServiceInterface,
    SiteContent,
    SiteContentInterface,
    UoW,
)
from domain.site import ContactRequestCreate
from service.notifications import NotificationService

from .exceptions import (
    InvalidContactRequestCursorError,
    SiteContentNotFoundError,
    UnknownServiceSelectionError,
)


class SiteService:
    def __init__(
        self,
        *,
        uow: UoW,
        service_repo: ServiceInterface,
        site_content_repo: SiteContentInterface,
        contact_request_repo: ContactRequestInterface,
        notification_service: NotificationService,
    ) -> None:
        self.uow = uow
        self.service_repo = service_repo
        self.site_content_repo = site_content_repo
        self.contact_request_repo = contact_request_repo
        self.notification_service = notification_service

    async def list_services(self) -> list[Service]:
        return await self.service_repo.list(active_only=True)

    async def get_site_content(self) -> SiteContent:
        site_content = await self.site_content_repo.get("main")
        if site_content is None:
            raise SiteContentNotFoundError()
        return site_content

    async def admin_list_contact_requests(
        self,
        *,
        service_slug: str | None = None,
        search: str | None = None,
        limit: int = 50,
        cursor: str | None = None,
    ) -> tuple[list[ContactRequest], str | None, int]:
        cursor_created_at: datetime | None = None
        cursor_id: UUID | None = None
        if cursor:
            try:
                ts_str, id_str = cursor.split("_", 1)
                cursor_created_at = datetime.fromisoformat(ts_str)
                cursor_id = UUID(id_str)
            except Exception as exc:
                raise InvalidContactRequestCursorError() from exc

        items = await self.contact_request_repo.list(
            service_slug=service_slug,
            search=search,
            limit=limit,
            cursor_created_at=cursor_created_at,
            cursor_id=cursor_id,
        )
        total = await self.contact_request_repo.count(service_slug=service_slug)

        next_cursor: str | None = None
        if len(items) == limit:
            last = items[-1]
            if last.created_at is not None:
                next_cursor = f"{last.created_at.isoformat()}_{last.id}"

        return items, next_cursor, total

    async def create_contact_request(self, payload: ContactRequestCreate) -> ContactRequest:
        service_slug = payload.service_slug
        service_label = payload.service_label.strip()

        if service_slug is not None:
            service = await self.service_repo.get_by_slug(service_slug)
            if service is None or not service.is_active:
                raise UnknownServiceSelectionError()
            service_label = service.title
        elif not service_label:
            raise UnknownServiceSelectionError("Service label is required")

        contact_request = ContactRequest(
            full_name=payload.full_name.strip(),
            phone=payload.phone.strip(),
            email=str(payload.email),
            service_slug=service_slug,
            service_label=service_label,
            vehicle_type=payload.vehicle_type.strip(),
            preferred_date=payload.preferred_date,
            message=payload.message.strip(),
        )
        await self.contact_request_repo.add(contact_request)
        await self.uow.commit()
        await self.uow.session.refresh(contact_request)

        await self.notification_service.send_text(
            self._render_contact_request_notification(contact_request)
        )

        return contact_request

    @staticmethod
    def _render_contact_request_notification(contact_request: ContactRequest) -> str:
        lines = [
            "New quote request",
            f"Name: {contact_request.full_name}",
            f"Phone: {contact_request.phone}",
            f"Email: {contact_request.email}",
            f"Service: {contact_request.service_label}",
            f"Vehicle: {contact_request.vehicle_type}",
            f"Preferred date: {contact_request.preferred_date.isoformat()}",
        ]
        if contact_request.message:
            lines.append(f"Message: {contact_request.message}")
        return "\n".join(lines)
