from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..mixins import TimestampMixin
from ..table_base import Base


class SiteContent(TimestampMixin, Base):
    __tablename__ = "site_content"

    key: Mapped[str] = mapped_column(String(32), primary_key=True, default="main")
    home_hero: Mapped[dict] = mapped_column(JSONB, nullable=False)
    home_intro: Mapped[dict] = mapped_column(JSONB, nullable=False)
    services_page: Mapped[dict] = mapped_column(JSONB, nullable=False)
    fleet_page: Mapped[dict] = mapped_column(JSONB, nullable=False)
    why_choose: Mapped[dict] = mapped_column(JSONB, nullable=False)
    home_cta: Mapped[dict] = mapped_column(JSONB, nullable=False)
    about_page: Mapped[dict] = mapped_column(JSONB, nullable=False)
    contact_page: Mapped[dict] = mapped_column(JSONB, nullable=False)
    footer: Mapped[dict] = mapped_column(JSONB, nullable=False)
