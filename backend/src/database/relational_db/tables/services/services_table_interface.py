from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .services_table import Service


class ServiceInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, *, active_only: bool = True) -> list[Service]:
        stmt = select(Service)
        if active_only:
            stmt = stmt.where(Service.is_active.is_(True))
        stmt = stmt.order_by(Service.display_order.asc(), Service.created_at.asc(), Service.id.asc())
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def get_by_slug(self, slug: str) -> Service | None:
        return await self.session.scalar(select(Service).where(Service.slug == slug))

    async def count(self, *, active_only: bool = True) -> int:
        stmt = select(func.count(Service.id))
        if active_only:
            stmt = stmt.where(Service.is_active.is_(True))
        return int(await self.session.scalar(stmt) or 0)
