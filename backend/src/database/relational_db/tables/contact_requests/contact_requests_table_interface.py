from datetime import datetime
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .contact_requests_table import ContactRequest


class ContactRequestInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, contact_request: ContactRequest) -> ContactRequest:
        self.session.add(contact_request)
        return contact_request

    async def list(
        self,
        *,
        service_slug: str | None = None,
        search: str | None = None,
        limit: int = 50,
        cursor_created_at: datetime | None = None,
        cursor_id: UUID | None = None,
    ) -> list[ContactRequest]:
        stmt = select(ContactRequest)

        if service_slug is not None:
            stmt = stmt.where(ContactRequest.service_slug == service_slug)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    ContactRequest.full_name.ilike(pattern),
                    ContactRequest.email.ilike(pattern),
                    ContactRequest.phone.ilike(pattern),
                    ContactRequest.vehicle_type.ilike(pattern),
                )
            )

        if cursor_created_at is not None and cursor_id is not None:
            stmt = stmt.where(
                or_(
                    ContactRequest.created_at < cursor_created_at,
                    and_(
                        ContactRequest.created_at == cursor_created_at,
                        ContactRequest.id < cursor_id,
                    ),
                )
            )

        stmt = stmt.order_by(
            ContactRequest.created_at.desc(), ContactRequest.id.desc()
        ).limit(limit)

        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def count(self, *, service_slug: str | None = None) -> int:
        stmt = select(func.count(ContactRequest.id))
        if service_slug is not None:
            stmt = stmt.where(ContactRequest.service_slug == service_slug)
        result = await self.session.scalar(stmt)
        return int(result or 0)
