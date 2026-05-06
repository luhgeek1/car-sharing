export type SiteIconName = "star" | "shield-check" | "car" | "clock";

export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteHeroSection {
  badge: string;
  title: string;
  subtitle: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  image_url: string;
}

export interface SiteTextImageSection {
  badge: string;
  title: string;
  paragraphs: string[];
  image_url: string;
}

export interface SitePageIntro {
  badge: string;
  title: string;
  subtitle: string;
}

export interface SiteFeatureItem {
  icon: SiteIconName;
  title: string;
  description: string;
}

export interface SiteWhyChooseSection {
  badge: string;
  title: string;
  intro: string;
  image_url: string;
  items: SiteFeatureItem[];
}

export interface SiteCtaSection {
  badge: string;
  title: string;
  subtitle: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
}

export interface SiteAboutPage {
  hero: SitePageIntro;
  mission_title: string;
  mission_paragraphs: string[];
  image_url: string;
  promise_badge: string;
  promise_quote: string;
}

export interface SiteContactPage {
  badge: string;
  title: string;
  subtitle: string;
  location: string;
  service_area: string;
  phone: string;
  email: string;
  social_links: SiteLink[];
  success_title: string;
  success_message: string;
}

export interface SiteFooter {
  summary: string;
  social_links: SiteLink[];
  service_areas: string[];
}

export interface SiteContent {
  key: string;
  home_hero: SiteHeroSection;
  home_intro: SiteTextImageSection;
  services_page: SitePageIntro;
  fleet_page: SitePageIntro;
  why_choose: SiteWhyChooseSection;
  home_cta: SiteCtaSection;
  about_page: SiteAboutPage;
  contact_page: SiteContactPage;
  footer: SiteFooter;
  created_at: string;
  updated_at: string;
}
