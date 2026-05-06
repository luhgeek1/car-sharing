"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getSiteContent } from "@/shared/api/site";

export function SiteFooter() {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
  });

  const footer = data?.footer;
  const socialLinks = footer?.social_links ?? [];
  const serviceAreas = footer?.service_areas ?? [];

  return (
    <footer className="border-t border-white/10 bg-black pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-8">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-xl font-display font-light tracking-[0.15em] uppercase mb-6 inline-block"
            >
              Righteous <span className="font-medium">Rides</span>
            </Link>
            <p className="text-white/50 font-light text-sm max-w-sm leading-relaxed">
              {footer?.summary ??
                "Premium automotive services for luxury & performance vehicles."}
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40 mb-6">
              Connect
            </h4>
            <ul className="space-y-4 text-xs font-light tracking-wider text-white/70">
              {socialLinks.map((link) => (
                <li key={`${link.label}:${link.href}`}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40 mb-6">
              Location
            </h4>
            <ul className="space-y-4 text-xs font-light tracking-wider text-white/70">
              {serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-light tracking-[0.15em] text-white/40 uppercase">
          <p>&copy; {new Date().getFullYear()} Righteous Rides.</p>
          <div className="flex gap-6">
            <a href="/contact" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/contact" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
