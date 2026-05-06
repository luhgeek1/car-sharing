"""add site content, services, and contact requests

Revision ID: 24d4c0c5f0ce
Revises: c0f7a1b21f3a
Create Date: 2026-05-06 00:30:00.000000

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "24d4c0c5f0ce"
down_revision: Union[str, Sequence[str], None] = "c0f7a1b21f3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "services",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=False, server_default=""),
        sa.Column("long_description", sa.Text(), nullable=False, server_default=""),
        sa.Column("image_url", sa.String(length=1024), nullable=True),
        sa.Column(
            "inquiry_label",
            sa.String(length=80),
            nullable=False,
            server_default="Request a Quote",
        ),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
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
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_services_display_order", "services", ["display_order"])
    op.create_index("ix_services_is_active", "services", ["is_active"])

    op.create_table(
        "site_content",
        sa.Column("key", sa.String(length=32), nullable=False),
        sa.Column("home_hero", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("home_intro", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("services_page", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("fleet_page", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("why_choose", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("home_cta", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("about_page", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("contact_page", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("footer", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
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
        sa.PrimaryKeyConstraint("key"),
    )

    op.create_table(
        "contact_requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("phone", sa.String(length=64), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("service_slug", sa.String(length=64), nullable=True),
        sa.Column("service_label", sa.String(length=160), nullable=False),
        sa.Column("vehicle_type", sa.String(length=160), nullable=False),
        sa.Column("preferred_date", sa.Date(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False, server_default=""),
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
    op.create_index("ix_contact_requests_created_at", "contact_requests", ["created_at"])
    op.create_index("ix_contact_requests_service_slug", "contact_requests", ["service_slug"])

    services = sa.table(
        "services",
        sa.column("id", sa.Uuid()),
        sa.column("slug", sa.String()),
        sa.column("title", sa.String()),
        sa.column("short_description", sa.Text()),
        sa.column("long_description", sa.Text()),
        sa.column("image_url", sa.String()),
        sa.column("inquiry_label", sa.String()),
        sa.column("display_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
    )

    op.bulk_insert(
        services,
        [
            {
                "id": uuid4(),
                "slug": "luxury-rentals",
                "title": "Luxury Vehicle Rentals",
                "short_description": "Elite rentals for weekends, events, content shoots, and premium replacement needs.",
                "long_description": "Experience the thrill of driving elite vehicles for a weekend, events, content shoots, or as a premium replacement vehicle.",
                "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=2664",
                "inquiry_label": "Request a Quote",
                "display_order": 10,
                "is_active": True,
            },
            {
                "id": uuid4(),
                "slug": "professional-detailing",
                "title": "Professional Detailing",
                "short_description": "Paint correction, ceramic protection, and immaculate presentation for high-end vehicles.",
                "long_description": "From meticulous hand washes to multi-stage paint correction and ceramic coatings, we ensure your vehicle looks flawless.",
                "image_url": "https://images.unsplash.com/photo-1628156172605-ffdb6d13bd14?auto=format&fit=crop&q=80&w=2000",
                "inquiry_label": "Request a Quote",
                "display_order": 20,
                "is_active": True,
            },
            {
                "id": uuid4(),
                "slug": "window-tint",
                "title": "Window Tint",
                "short_description": "Premium ceramic tint for privacy, UV protection, and heat rejection.",
                "long_description": "High-performance ceramic window tinting that perfectly blends superior aesthetics, UV protection, and heat rejection.",
                "image_url": "https://images.unsplash.com/photo-1605515298946-d062f2e9da53?auto=format&fit=crop&q=80&w=2938",
                "inquiry_label": "Request a Quote",
                "display_order": 30,
                "is_active": True,
            },
            {
                "id": uuid4(),
                "slug": "vinyl-wrap",
                "title": "Vinyl Wrap",
                "short_description": "Premium color change wraps and protection film with clean execution.",
                "long_description": "Transform your vehicle's look with premium color change wraps or protect the factory finish with Paint Protection Film (PPF).",
                "image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
                "inquiry_label": "Request a Quote",
                "display_order": 40,
                "is_active": True,
            },
            {
                "id": uuid4(),
                "slug": "luxury-chauffeuring",
                "title": "Luxury Chauffeuring",
                "short_description": "Executive transport in a premium fleet with professional drivers.",
                "long_description": "Executive transport with professional drivers in our luxury fleet, ensuring you arrive on time and in ultimate comfort.",
                "image_url": "https://images.unsplash.com/photo-1549558549-415fe4c37b60?auto=format&fit=crop&q=80&w=2919",
                "inquiry_label": "Request a Quote",
                "display_order": 50,
                "is_active": True,
            },
            {
                "id": uuid4(),
                "slug": "automotive-work",
                "title": "Automotive Work",
                "short_description": "Specialized maintenance, support, and performance upgrades for enthusiast vehicles.",
                "long_description": "Specialized mechanical support, performance upgrades, and meticulous maintenance for high-end automotive machines.",
                "image_url": "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=2960",
                "inquiry_label": "Request a Quote",
                "display_order": 60,
                "is_active": True,
            },
        ],
    )

    site_content = sa.table(
        "site_content",
        sa.column("key", sa.String()),
        sa.column("home_hero", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("home_intro", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("services_page", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("fleet_page", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("why_choose", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("home_cta", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("about_page", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("contact_page", postgresql.JSONB(astext_type=sa.Text())),
        sa.column("footer", postgresql.JSONB(astext_type=sa.Text())),
    )

    op.bulk_insert(
        site_content,
        [
            {
                "key": "main",
                "home_hero": {
                    "badge": "Righteous Rides",
                    "title": "Premium Automotive\nServices",
                    "subtitle": "Luxury rentals, detailing, tint, vinyl wrap, chauffeuring, and automotive support built for clients who expect more than basic.",
                    "primary_cta_label": "Request a Quote",
                    "primary_cta_href": "/contact",
                    "secondary_cta_label": "View Services",
                    "secondary_cta_href": "/services",
                    "image_url": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2938&ixlib=rb-4.0.3",
                },
                "home_intro": {
                    "badge": "What We Do",
                    "title": "The Higher\nStandard",
                    "paragraphs": [
                        "We cater to owners and enthusiasts of elite vehicles including Corvette, Porsche, BMW, Tesla, Lamborghini, McLaren, and Mercedes-AMG. Our focus is on professional presentation, protection, and performance.",
                        "Righteous Rides provides high-end vehicle rentals, detailing, tint, vinyl wrap, chauffeuring, and automotive services built for absolute precision.",
                    ],
                    "image_url": "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&q=80&w=2664&ixlib=rb-4.0.3",
                },
                "services_page": {
                    "badge": "Expertise",
                    "title": "Premium\nServices",
                    "subtitle": "Comprehensive high-end automotive solutions built for clients who expect more than basic.",
                },
                "fleet_page": {
                    "badge": "Collection",
                    "title": "The\nFleet",
                    "subtitle": "Our curated selection of luxury and performance vehicles available for rentals and chauffeuring.",
                },
                "why_choose": {
                    "badge": "Philosophy",
                    "title": "Why\nRighteous Rides",
                    "intro": "We understand the standard of care required for high-end automotive machines. Our entire operation is built on trust, precision, and delivering an unmatched experience.",
                    "image_url": "https://images.unsplash.com/photo-1544886588-ac0127599767?auto=format&fit=crop&q=80&w=2940",
                    "items": [
                        {
                            "icon": "star",
                            "title": "Premium Vehicle Focus",
                            "description": "We specialize exclusively in luxury and performance vehicles.",
                        },
                        {
                            "icon": "shield-check",
                            "title": "Professional Service",
                            "description": "Trained experts utilizing state-of-the-art tools and techniques.",
                        },
                        {
                            "icon": "car",
                            "title": "High-End Presentation",
                            "description": "Every vehicle delivered immaculately, every time.",
                        },
                        {
                            "icon": "clock",
                            "title": "Flexible & Trusted",
                            "description": "Seamless booking, clear communication, and reliable care.",
                        },
                    ],
                },
                "home_cta": {
                    "badge": "Next Steps",
                    "title": "Ready for a\nHigher Standard?",
                    "subtitle": "Contact us today to request a quote or book your premium automotive service.",
                    "primary_cta_label": "Request a Quote",
                    "primary_cta_href": "/contact",
                    "secondary_cta_label": "View Fleet",
                    "secondary_cta_href": "/fleet",
                },
                "about_page": {
                    "hero": {
                        "badge": "Our Story",
                        "title": "About\nRighteous Rides",
                        "subtitle": "Righteous Rides was built for clients who care about presentation, performance, and uncompromising quality.",
                    },
                    "mission_title": "Our Mission",
                    "mission_paragraphs": [
                        "Whether you need a luxury rental, a professional detail, tint, wrap, chauffeuring, or automotive support, our goal is to deliver a higher standard of service from start to finish.",
                        "We started Righteous Rides because we saw a gap in the market. True automotive enthusiasts and owners of elite vehicles require a level of care that basic local shops simply do not provide. We treat every vehicle as if it were our own, utilizing only the finest products and techniques to ensure immaculate results.",
                    ],
                    "image_url": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&q=80&w=2942",
                    "promise_badge": "The Premium Promise",
                    "promise_quote": "To provide uncompromising quality, absolute discretion, and a flawless automotive experience for those who demand excellence.",
                },
                "contact_page": {
                    "badge": "Inquiries",
                    "title": "Request a\nQuote",
                    "subtitle": "Ready to elevate your automotive experience? Provide a few details and our team will get back to you promptly.",
                    "location": "Denver, Colorado",
                    "service_area": "Serving the greater metro area",
                    "phone": "(555) 123-4567",
                    "email": "info@righteousrides.com",
                    "social_links": [
                        {
                            "label": "Instagram",
                            "href": "https://instagram.com/righteousrides",
                        }
                    ],
                    "success_title": "Request Received",
                    "success_message": "Thank you for reaching out. A Righteous Rides representative will contact you shortly.",
                },
                "footer": {
                    "summary": "Premium automotive services for luxury and performance vehicles. Built for clients who expect more than basic. High-end service from start to finish.",
                    "social_links": [
                        {
                            "label": "Instagram",
                            "href": "https://instagram.com/righteousrides",
                        },
                        {
                            "label": "Contact",
                            "href": "/contact",
                        }
                    ],
                    "service_areas": [
                        "Denver, Colorado",
                        "Colorado Springs",
                        "Metro Area",
                    ],
                },
            }
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_contact_requests_service_slug", table_name="contact_requests")
    op.drop_index("ix_contact_requests_created_at", table_name="contact_requests")
    op.drop_table("contact_requests")

    op.drop_table("site_content")

    op.drop_index("ix_services_is_active", table_name="services")
    op.drop_index("ix_services_display_order", table_name="services")
    op.drop_table("services")
