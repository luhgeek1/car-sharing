"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";

import { listServices } from "@/shared/api/services";
import { getSiteContent } from "@/shared/api/site";
import { splitTitleLines } from "@/shared/lib/siteContent";

export default function ServicesPage() {
  const { data: services, isLoading, isError } = useQuery({
    queryKey: ["services"],
    queryFn: listServices,
  });
  const { data: siteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
  });

  const intro = siteContent?.services_page;
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
            Loading services…
          </div>
        ) : isError ? (
          <div className="border border-white/10 bg-[#050505] p-12 text-center text-white/50 font-light tracking-wide text-sm">
            Unable to load services right now. Please try again shortly.
          </div>
        ) : (
          <div className="space-y-20 lg:space-y-32">
            {(services ?? []).map((service, i) => (
              <div
                key={service.id}
                className={`flex flex-col ${
                  i % 2 !== 0 ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-8 lg:gap-24 items-center`}
              >
                <motion.div
                  initial={{ opacity: 0, x: i % 2 !== 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-full lg:w-1/2 relative"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    {service.image_url ? (
                      <Image
                        src={service.image_url}
                        alt={service.title}
                        width={1600}
                        height={1200}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="h-full w-full object-cover grayscale-[0.4]"
                      />
                    ) : (
                      <div className="h-full w-full bg-ink" />
                    )}
                  </div>
                  <div className="absolute inset-0 border border-white/10 pointer-events-none" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: i % 2 !== 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-full lg:w-1/2 text-center lg:text-left"
                >
                  <h2 className="text-2xl sm:text-3xl font-display font-light uppercase tracking-[0.1em] mb-4 lg:mb-8">
                    {service.title}
                  </h2>
                  <p className="text-white/50 font-light tracking-wide leading-relaxed mb-8 lg:mb-10 text-base sm:text-lg">
                    {service.long_description}
                  </p>
                  {service.inquiry_label ? (
                    <Link
                      href="/contact"
                      className="px-8 py-4 bg-transparent border border-white/30 text-white text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all inline-block w-full sm:w-auto"
                    >
                      {service.inquiry_label}
                    </Link>
                  ) : null}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
