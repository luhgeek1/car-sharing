"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/providers/auth/useAuth";
import { cn } from "@/shared/lib/utils";
import { UserMenu } from "@/features/navigation/UserMenu";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Fleet", path: "/fleet" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const auth = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = auth?.user?.roles?.includes("admin") ?? false;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 border-b",
          isScrolled
            ? "bg-black/80 backdrop-blur-md border-white/10 py-5"
            : "bg-transparent py-6 border-transparent",
        )}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center font-display font-medium text-white border border-white/30 text-[10px] tracking-widest uppercase">
              RR
            </div>
            <span className="text-lg md:text-xl font-display font-light tracking-[0.15em] uppercase">
              Righteous <span className="font-medium">Rides</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className={cn(
                      "transition-colors duration-300",
                      pathname === link.path
                        ? "text-white"
                        : "hover:text-white",
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {isAdmin ? (
                <li>
                  <Link
                    href="/admin/cars"
                    className={cn(
                      "transition-colors duration-300",
                      pathname.startsWith("/admin")
                        ? "text-white"
                        : "hover:text-white",
                    )}
                  >
                    Admin
                  </Link>
                </li>
              ) : null}
            </ul>

            <div className="flex items-center gap-6">
              {auth?.user ? (
                <UserMenu />
              ) : (
                <Link
                  href="/auth"
                  className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors duration-300"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/contact"
                className="bg-transparent border border-white text-white px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300"
              >
                Request a Quote
              </Link>
            </div>
          </nav>

          <button
            type="button"
            className="md:hidden text-white"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 bg-black z-40 flex flex-col items-center justify-center transition-all duration-500 md:hidden",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <nav className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={cn(
                "text-2xl font-display font-light tracking-[0.2em] uppercase hover:text-gray transition-colors",
                pathname === link.path ? "text-white" : "text-white/50",
              )}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href="/admin/cars"
              className={cn(
                "text-2xl font-display font-light tracking-[0.2em] uppercase hover:text-gray transition-colors",
                pathname.startsWith("/admin")
                  ? "text-white"
                  : "text-white/50",
              )}
            >
              Admin
            </Link>
          ) : null}
          {auth?.user ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  "text-2xl font-display font-light tracking-[0.2em] uppercase hover:text-gray transition-colors",
                  pathname === "/profile" ? "text-white" : "text-white/50",
                )}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => auth.logout()}
                className="text-2xl font-display font-light tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-2xl font-display font-light tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/contact"
            className="mt-8 px-8 py-3 border border-white/30 text-white text-xs tracking-widest uppercase font-medium hover:border-white hover:bg-white hover:text-black transition-colors"
          >
            Request a Quote
          </Link>
        </nav>
      </div>
    </>
  );
}
