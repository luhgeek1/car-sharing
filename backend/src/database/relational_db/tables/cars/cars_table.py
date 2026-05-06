from decimal import Decimal
from uuid import UUID, uuid4
from sqlalchemy import Boolean, Integer, Numeric, String, Text, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from ..table_base import Base
from ..mixins import TimestampMixin


class Car(TimestampMixin, Base):
    __tablename__ = "cars"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    brand: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    category: Mapped[str] = mapped_column(String(32), nullable=False, default="luxury")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")

    images: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}", default=list
    )

    price_per_day: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    highlights: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}", default=list
    )
    is_available: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
