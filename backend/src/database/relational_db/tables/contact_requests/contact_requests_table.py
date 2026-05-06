from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import Date, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from ..mixins import TimestampMixin
from ..table_base import Base


class ContactRequest(TimestampMixin, Base):
    __tablename__ = "contact_requests"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    service_slug: Mapped[str | None] = mapped_column(String(64), nullable=True)
    service_label: Mapped[str] = mapped_column(String(160), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(160), nullable=False)
    preferred_date: Mapped[date] = mapped_column(Date, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
