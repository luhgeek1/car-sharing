import Link from "next/link";
import type { ReactNode } from "react";

import { RequireAdmin } from "@/providers/auth/RequireAdmin";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-black pt-24">
        <div className="border-b border-white/10 bg-black/40">
          <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
            <div className="space-y-2">
              <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
                Admin console
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-light uppercase tracking-[0.1em] text-white">
                Righteous Rides &mdash; <span className="text-white/50">internal</span>
              </h1>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]">
              <Link
                href="/admin"
                className="border border-white/15 px-4 py-2 text-white/70 hover:bg-white hover:text-black transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/cars"
                className="border border-white/15 px-4 py-2 text-white/70 hover:bg-white hover:text-black transition-colors"
              >
                Cars
              </Link>
              <Link
                href="/admin/requests"
                className="border border-white/15 px-4 py-2 text-white/70 hover:bg-white hover:text-black transition-colors"
              >
                Requests
              </Link>
              <Link
                href="/"
                className="border border-white/15 px-4 py-2 text-white/70 hover:bg-white hover:text-black transition-colors"
              >
                Back to site
              </Link>
            </nav>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl px-6 py-12">{children}</div>
      </div>
    </RequireAdmin>
  );
}
