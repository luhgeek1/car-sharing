"""cars: replace image_url with images TEXT[]

Revision ID: d3f1c8a9e210
Revises: 24d4c0c5f0ce
Create Date: 2026-05-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d3f1c8a9e210"
down_revision: Union[str, Sequence[str], None] = "24d4c0c5f0ce"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "cars",
        sa.Column(
            "images",
            sa.dialects.postgresql.ARRAY(sa.Text()),
            nullable=False,
            server_default="{}",
        ),
    )

    op.execute(
        """
        UPDATE cars
        SET images = ARRAY[image_url]
        WHERE image_url IS NOT NULL AND image_url <> ''
        """
    )

    op.drop_column("cars", "image_url")


def downgrade() -> None:
    op.add_column(
        "cars",
        sa.Column("image_url", sa.String(length=1024), nullable=True),
    )
    op.execute(
        """
        UPDATE cars
        SET image_url = images[1]
        WHERE array_length(images, 1) >= 1
        """
    )
    op.drop_column("cars", "images")
