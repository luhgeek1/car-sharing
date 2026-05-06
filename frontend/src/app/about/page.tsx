"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";

import { getSiteContent } from "@/shared/api/site";
import { splitTitleLines } from "@/shared/lib/siteContent";

export default function AboutPage() {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
  });

  const about = data?.about_page;
  const hero = about?.hero;
  const titleLines = hero?.title ? splitTitleLines(hero.title) : [];

  return (
    <div className="w-full pt-32 lg:pt-40 pb-20 lg:pb-32">
      <div className="container mx-auto px-6 max-w-4xl text-center mb-16 lg:mb-24">
        {hero?.badge ? (
          <div className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] mb-4 lg:mb-6">
            {hero.badge}
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
        {hero?.subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-white/50 font-light tracking-wide leading-relaxed"
          >
            {hero.subtitle}
          </motion.p>
        ) : null}
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="aspect-[4/3] h-[300px] sm:h-[400px] lg:h-[600px] w-full border border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            {about?.image_url ? (
              <Image
                src={about.image_url}
                alt="Automotive professional"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover grayscale-[0.4]"
              />
            ) : (
              <div className="absolute inset-0 bg-ink" />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            {about?.mission_title ? (
              <h2 className="text-2xl sm:text-3xl font-display font-light uppercase tracking-[0.1em] mb-6 lg:mb-8 text-white">
                {about.mission_title}
              </h2>
            ) : null}
            {(about?.mission_paragraphs ?? []).map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 16)}`}
                className={
                  index === 0
                    ? "text-white/50 font-light tracking-wide text-base sm:text-lg leading-relaxed mb-6 lg:mb-8"
                    : "text-white/40 font-light tracking-wide text-base sm:text-lg leading-relaxed"
                }
              >
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>

        {about?.promise_quote ? (
          <div className="border border-white/10 bg-[#050505] p-8 sm:p-12 lg:p-24 text-center max-w-4xl mx-auto flex flex-col items-center">
            {about.promise_badge ? (
              <h2 className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-[0.3em] mb-6 lg:mb-8">
                {about.promise_badge}
              </h2>
            ) : null}
            <p className="text-xl sm:text-2xl md:text-4xl font-display font-light text-white leading-relaxed md:leading-tight uppercase tracking-[0.05em] max-w-3xl">
              &ldquo;{about.promise_quote}&rdquo;
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
