from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .site_content_table import SiteContent


class SiteContentInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, key: str = "main") -> SiteContent | None:
        return await self.session.scalar(select(SiteContent).where(SiteContent.key == key))
