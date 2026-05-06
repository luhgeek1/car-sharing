import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";

import { Providers } from "@/providers/Providers";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { SiteFooter } from "@/features/navigation/SiteFooter";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Righteous Rides — Premium Automotive Services",
    template: "%s · Righteous Rides",
  },
  description:
    "Luxury rentals, professional detailing, window tint, vinyl wrap, chauffeuring, and automotive services in Colorado.",
  keywords: [
    "luxury car rentals colorado",
    "luxury car rentals denver",
    "performance car rentals",
    "corvette rental colorado",
    "porsche rental colorado",
    "auto detailing colorado",
    "luxury chauffeuring colorado",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-black font-sans text-white antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
