"""create cars table

Revision ID: c0f7a1b21f3a
Revises: a629654c84b7
Create Date: 2026-05-06 00:00:00.000000

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


revision: str = "c0f7a1b21f3a"
down_revision: Union[str, Sequence[str], None] = "a629654c84b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cars",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("brand", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False, server_default="luxury"),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("image_url", sa.String(length=1024), nullable=True),
        sa.Column("price_per_day", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "highlights",
            sa.dialects.postgresql.ARRAY(sa.Text()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cars_category", "cars", ["category"])
    op.create_index("ix_cars_is_available", "cars", ["is_available"])

    cars = sa.table(
        "cars",
        sa.column("id", sa.Uuid()),
        sa.column("name", sa.String()),
        sa.column("brand", sa.String()),
        sa.column("model", sa.String()),
        sa.column("year", sa.Integer()),
        sa.column("category", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("image_url", sa.String()),
        sa.column("price_per_day", sa.Numeric()),
        sa.column("highlights", sa.dialects.postgresql.ARRAY(sa.Text())),
        sa.column("is_available", sa.Boolean()),
    )

    op.bulk_insert(
        cars,
        [
            {
                "id": uuid4(),
                "name": "Corvette C8 Stingray",
                "brand": "Chevrolet",
                "model": "Corvette C8 Stingray",
                "year": 2024,
                "category": "performance",
                "description": (
                    "A head-turning American performance icon built for weekend rentals, "
                    "events, content shoots, and special occasions."
                ),
                "image_url": "https://images.unsplash.com/photo-1617814086367-3a3a8c2d8b1e?w=1600&q=80",
                "price_per_day": 599.00,
                "highlights": ["Mid-engine V8", "0-60 in 2.9s", "Magnetic Ride Control"],
                "is_available": True,
            },
            {
                "id": uuid4(),
                "name": "Porsche Panamera Turbo",
                "brand": "Porsche",
                "model": "Panamera Turbo",
                "year": 2023,
                "category": "luxury",
                "description": (
                    "Executive luxury with motorsport DNA. Ideal for chauffeured arrivals "
                    "and long-distance comfort."
                ),
                "image_url": "https://images.unsplash.com/photo-1611821064430-0d40291922d3?w=1600&q=80",
                "price_per_day": 749.00,
                "highlights": ["Twin-turbo V8", "Adaptive air suspension", "Bose surround sound"],
                "is_available": True,
            },
            {
                "id": uuid4(),
                "name": "BMW X7 M60i",
                "brand": "BMW",
                "model": "X7 M60i",
                "year": 2024,
                "category": "suv",
                "description": (
                    "Three-row premium SUV for groups, road trips, and high-end travel."
                ),
                "image_url": "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=1600&q=80",
                "price_per_day": 489.00,
                "highlights": ["Twin-turbo V8", "Massaging seats", "Panoramic Sky Lounge"],
                "is_available": True,
            },
            {
                "id": uuid4(),
                "name": "Tesla Model Y Performance",
                "brand": "Tesla",
                "model": "Model Y Performance",
                "year": 2024,
                "category": "electric",
                "description": (
                    "All-electric daily driver with instant torque and modern tech."
                ),
                "image_url": "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1600&q=80",
                "price_per_day": 259.00,
                "highlights": ["Dual-motor AWD", "0-60 in 3.5s", "Autopilot included"],
                "is_available": True,
            },
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_cars_is_available", table_name="cars")
    op.drop_index("ix_cars_category", table_name="cars")
    op.drop_table("cars")
