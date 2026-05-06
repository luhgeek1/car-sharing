"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";

import { listCars } from "@/shared/api/cars";
import { getSiteContent } from "@/shared/api/site";
import type { Car } from "@/entities/car/model";
import { splitTitleLines } from "@/shared/lib/siteContent";

export default function FleetPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cars"],
    queryFn: () => listCars({ limit: 50 }),
  });
  const { data: siteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
  });

  const cars: Car[] = data?.items ?? [];
  const intro = siteContent?.fleet_page;
  const titleLines = intro?.title ? splitTitleLines(intro.title) : [];

  return (
    <div className="w-full pt-32 lg:pt-40 pb-20 lg:pb-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 lg:mb-32 max-w-3xl mx-auto">
          {intro?.badge ? (
            <div className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] mb-4 lg:mb-6">
              {intro.badge}
            </div>
          ) : null}
          {titleLines[0] ? (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-light uppercase tracking-[0.05em] mb-4 lg:mb-6"
            >
              {titleLines[0]}
              {titleLines[1] ? (
                <>
                  {" "}
                  <span className="font-medium text-white/50">{titleLines[1]}</span>
                </>
              ) : null}
            </motion.h1>
          ) : null}
          {intro?.subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 font-light text-base sm:text-lg tracking-wide leading-relaxed"
            >
              {intro.subtitle}
            </motion.p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="border border-white/10 bg-[#050505] p-12 text-center text-white/50 font-light tracking-wide text-sm">
            Loading the fleet…
          </div>
        ) : isError ? (
          <div className="border border-white/10 bg-[#050505] p-12 text-center text-white/50 font-light tracking-wide text-sm">
            Unable to load the fleet right now. Please try again shortly.
          </div>
        ) : cars.length === 0 ? (
          <div className="border border-white/10 bg-[#050505] p-12 text-center space-y-6">
            <p className="text-white/50 font-light tracking-wide text-sm">
              No vehicles available yet. Check back shortly.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-black text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {cars.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#050505] border border-white/10 overflow-hidden flex flex-col group"
              >
                <Link
                  href={`/fleet/${vehicle.id}`}
                  className="aspect-[16/10] overflow-hidden relative block"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors z-10 duration-700" />
                  {vehicle.images[0] ? (
                    <Image
                      src={vehicle.images[0]}
                      alt={vehicle.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
                      No photo
                    </div>
                  )}
                  {vehicle.images.length > 1 ? (
                    <span className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/85 backdrop-blur">
                      {vehicle.images.length} photos
                    </span>
                  ) : null}
                </Link>
                <div className="p-8 lg:p-12 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-display font-light uppercase tracking-[0.1em] text-white">
                      {vehicle.name}
                    </h2>
                    {!vehicle.is_available ? (
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 border border-white/20 px-3 py-1">
                        Booked
                      </span>
                    ) : null}
                  </div>
                  <p className="text-white/50 font-light text-sm tracking-wide mb-8 leading-relaxed">
                    {vehicle.description}
                  </p>
                  <div className="mb-10 flex-1">
                    <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-4 pb-4 border-b border-white/5">
                      Highlights
                    </h4>
                    <ul className="space-y-4">
                      {(vehicle.highlights ?? []).map((highlight) => (
                        <li
                          key={highlight}
                          className="text-xs font-light text-white/70 tracking-wide flex items-center before:content-[''] before:inline-block before:w-1 whitespace-pre-wrap before:h-px before:bg-white/50 before:mr-4"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/contact"
                    className="w-full text-center px-6 py-4 bg-transparent border border-white/30 text-white text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                  >
                    Check Availability
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
