from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from domain.common import TimestampModel


class SiteLink(BaseModel):
    label: str = Field(..., min_length=1, max_length=80)
    href: str = Field(..., min_length=1, max_length=2048)


class SiteHeroSection(BaseModel):
    badge: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=2000)
    subtitle: str = Field(..., min_length=1, max_length=4000)
    primary_cta_label: str = Field(..., min_length=1, max_length=80)
    primary_cta_href: str = Field(..., min_length=1, max_length=256)
    secondary_cta_label: str = Field(..., min_length=1, max_length=80)
    secondary_cta_href: str = Field(..., min_length=1, max_length=256)
    image_url: str = Field(..., min_length=1, max_length=2048)


class SiteTextImageSection(BaseModel):
    badge: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=1000)
    paragraphs: list[str] = Field(default_factory=list, min_length=1, max_length=6)
    image_url: str = Field(..., min_length=1, max_length=2048)


class SitePageIntro(BaseModel):
    badge: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=1000)
    subtitle: str = Field(..., min_length=1, max_length=4000)


class SiteFeatureItem(BaseModel):
    icon: Literal["star", "shield-check", "car", "clock"] = "star"
    title: str = Field(..., min_length=1, max_length=160)
    description: str = Field(..., min_length=1, max_length=4000)


class SiteWhyChooseSection(BaseModel):
    badge: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=1000)
    intro: str = Field(..., min_length=1, max_length=4000)
    image_url: str = Field(..., min_length=1, max_length=2048)
    items: list[SiteFeatureItem] = Field(default_factory=list, min_length=1, max_length=8)


class SiteCtaSection(BaseModel):
    badge: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=1000)
    subtitle: str = Field(..., min_length=1, max_length=4000)
    primary_cta_label: str = Field(..., min_length=1, max_length=80)
    primary_cta_href: str = Field(..., min_length=1, max_length=256)
    secondary_cta_label: str = Field(..., min_length=1, max_length=80)
    secondary_cta_href: str = Field(..., min_length=1, max_length=256)


class SiteAboutPage(BaseModel):
    hero: SitePageIntro
    mission_title: str = Field(..., min_length=1, max_length=160)
    mission_paragraphs: list[str] = Field(default_factory=list, min_length=1, max_length=6)
    image_url: str = Field(..., min_length=1, max_length=2048)
    promise_badge: str = Field(..., min_length=1, max_length=80)
    promise_quote: str = Field(..., min_length=1, max_length=4000)


class SiteContactPage(BaseModel):
    badge: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=1000)
    subtitle: str = Field(..., min_length=1, max_length=4000)
    location: str = Field(..., min_length=1, max_length=200)
    service_area: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=1, max_length=64)
    email: str = Field(..., min_length=1, max_length=320)
    social_links: list[SiteLink] = Field(default_factory=list, max_length=8)
    success_title: str = Field(..., min_length=1, max_length=160)
    success_message: str = Field(..., min_length=1, max_length=1000)


class SiteFooter(BaseModel):
    summary: str = Field(..., min_length=1, max_length=4000)
    social_links: list[SiteLink] = Field(default_factory=list, max_length=8)
    service_areas: list[str] = Field(default_factory=list, max_length=8)


class SiteContentModel(TimestampModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    home_hero: SiteHeroSection
    home_intro: SiteTextImageSection
    services_page: SitePageIntro
    fleet_page: SitePageIntro
    why_choose: SiteWhyChooseSection
    home_cta: SiteCtaSection
    about_page: SiteAboutPage
    contact_page: SiteContactPage
    footer: SiteFooter


class ServiceModel(TimestampModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    short_description: str
    long_description: str
    image_url: str | None
    inquiry_label: str
    display_order: int
    is_active: bool
