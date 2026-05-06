"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Star, Clock, Car } from "lucide-react";
import type { ReactNode } from "react";

import { listServices } from "@/shared/api/services";
import { getSiteContent } from "@/shared/api/site";
import type { SiteFeatureItem } from "@/entities/site/model";
import { splitTitleLines } from "@/shared/lib/siteContent";

const featureIconMap = {
  star: <Star strokeWidth={1} className="w-6 h-6 lg:w-7 lg:h-7" />,
  "shield-check": <ShieldCheck strokeWidth={1} className="w-6 h-6 lg:w-7 lg:h-7" />,
  car: <Car strokeWidth={1} className="w-6 h-6 lg:w-7 lg:h-7" />,
  clock: <Clock strokeWidth={1} className="w-6 h-6 lg:w-7 lg:h-7" />,
} satisfies Record<SiteFeatureItem["icon"], ReactNode>;

export default function HomePage() {
  const { data: services, isLoading: servicesLoading, isError: servicesError } = useQuery({
    queryKey: ["services"],
    queryFn: listServices,
  });
  const { data: siteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
  });

  const hero = siteContent?.home_hero;
  const homeIntro = siteContent?.home_intro;
  const whyChoose = siteContent?.why_choose;
  const cta = siteContent?.home_cta;
  const heroTitleLines = hero?.title ? splitTitleLines(hero.title) : [];
  const introTitleLines = homeIntro?.title
    ? splitTitleLines(homeIntro.title)
    : [];
  const whyChooseTitleLines = whyChoose?.title
    ? splitTitleLines(whyChoose.title)
    : [];
  const ctaTitleLines = cta?.title ? splitTitleLines(cta.title) : [];

  return (
    <div className="w-full">
      <section className="relative h-screen min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          {hero?.image_url ? (
            <Image
              src={hero.image_url}
              alt="Luxury vehicle"
              fill
              priority
              sizes="100vw"
              className="object-cover grayscale-[0.2]"
            />
          ) : (
            <div className="absolute inset-0 bg-ink" />
          )}
        </div>

        <div className="container relative z-20 mx-auto px-6 max-w-7xl pt-16 lg:pt-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl flex flex-col items-center"
          >
            {hero?.badge ? (
              <div className="text-white/50 text-[10px] md:text-xs font-medium uppercase tracking-[0.3em] mb-4 md:mb-8 flex items-center justify-center gap-4">
                <span className="w-8 md:w-12 h-px bg-white/30 hidden sm:block"></span>
                {hero.badge}
                <span className="w-8 md:w-12 h-px bg-white/30 hidden sm:block"></span>
              </div>
            ) : null}
            {heroTitleLines[0] ? (
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light leading-[1.05] tracking-[0.02em] uppercase mb-6 md:mb-8 w-full mx-auto">
                {heroTitleLines[0]
                  .split(" ")
                  .map((word, idx, words) => (
                    <span key={`${idx}-${word}`}>
                      {word}
                      {idx < words.length - 1 ? (
                        <>
                          {" "}
                          <br className="sm:hidden" />
                        </>
                      ) : null}
                    </span>
                  ))}
                {heroTitleLines[1] ? (
                  <>
                    {" "}
                    <br className="hidden sm:block" />
                    <span className="font-medium">{heroTitleLines[1]}</span>
                  </>
                ) : null}
              </h1>
            ) : null}
            {hero?.subtitle ? (
              <p className="text-base sm:text-lg md:text-xl text-white/60 font-light max-w-2xl mb-8 md:mb-12 leading-relaxed tracking-wide px-2 sm:px-0">
                {hero.subtitle}
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
              {hero?.primary_cta_label && hero?.primary_cta_href ? (
                <Link
                  href={hero.primary_cta_href}
                  className="px-8 py-4 bg-white text-black text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors w-full sm:w-auto text-center"
                >
                  {hero.primary_cta_label}
                </Link>
              ) : null}
              {hero?.secondary_cta_label && hero?.secondary_cta_href ? (
                <Link
                  href={hero.secondary_cta_href}
                  className="px-8 py-4 border border-white/30 text-white text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium hover:border-white hover:bg-white hover:text-black transition-all w-full sm:w-auto text-center flex items-center justify-center gap-3"
                >
                  {hero.secondary_cta_label} <ArrowRight size={14} />
                </Link>
              ) : null}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {introTitleLines[0] ? (
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light uppercase tracking-[0.05em] mb-8 md:mb-10">
                  {introTitleLines[0]}
                  {introTitleLines[1] ? (
                    <>
                      <br className="hidden md:block" />
                      <span className="font-medium text-white/50">{introTitleLines[1]}</span>
                    </>
                  ) : null}
                </h2>
              ) : null}
              {(homeIntro?.paragraphs ?? []).map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph.slice(0, 16)}`}
                  className={
                    index === (homeIntro?.paragraphs.length ?? 0) - 1
                      ? "text-white/60 font-light leading-relaxed text-base sm:text-lg md:text-xl mb-8 md:mb-10 tracking-wide"
                      : "text-white/60 font-light leading-relaxed text-base sm:text-lg md:text-xl mb-6 md:mb-8 tracking-wide"
                  }
                >
                  {paragraph}
                </p>
              ))}
              <Link
                href="/about"
                className="inline-flex items-center text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium hover:text-gray-300 transition-colors border-b border-white/30 pb-1 hover:border-white"
              >
                Learn About Us
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] overflow-hidden mt-8 lg:mt-0"
            >
              {homeIntro?.image_url ? (
                <Image
                  src={homeIntro.image_url}
                  alt="Precision detailing"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale-[0.4]"
                />
              ) : (
                <div className="absolute inset-0 bg-ink" />
              )}
              <div className="absolute inset-0 border border-white/10" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 border-t border-white/5 bg-[#050505]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-20 gap-6 lg:gap-8">
            <div className="max-w-2xl">
              <div className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] mb-4 md:mb-6">
                Expertise
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light uppercase tracking-[0.05em] mb-4 md:mb-6">
                Our <span className="font-medium">Services</span>
              </h2>
              <p className="text-white/50 font-light text-base sm:text-lg tracking-wide">
                Premium automotive solutions from start to finish.
              </p>
            </div>
            <Link
              href="/services"
              className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium hover:text-white text-white/50 transition-colors pb-1 inline-flex items-center gap-3 w-fit"
            >
              View All Services <ArrowRight size={14} />
            </Link>
          </div>

          {servicesLoading ? (
            <div className="border border-white/10 bg-black/40 p-12 text-center text-white/50 font-light tracking-wide text-sm">
              Loading services…
            </div>
          ) : servicesError ? (
            <div className="border border-white/10 bg-black/40 p-12 text-center text-white/50 font-light tracking-wide text-sm">
              Unable to load services right now. Please try again shortly.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {(services ?? []).slice(0, 6).map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative h-[350px] sm:h-[400px] lg:h-[450px] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 z-10" />
                  {service.image_url ? (
                    <Image
                      src={service.image_url}
                      alt={service.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-ink" />
                  )}
                  <div className="absolute inset-0 border border-white/10 z-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <h3 className="text-lg lg:text-xl font-display font-light uppercase tracking-widest mb-2 lg:mb-3 text-white">
                      {service.title}
                    </h3>
                    <p className="text-white/60 font-light text-xs lg:text-sm tracking-wide leading-relaxed line-clamp-2 group-hover:text-white/80 transition-colors">
                      {service.short_description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              {whyChoose?.badge ? (
                <div className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] mb-4 md:mb-6">
                  {whyChoose.badge}
                </div>
              ) : null}
              {whyChooseTitleLines[0] ? (
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light uppercase tracking-[0.05em] mb-6 md:mb-10">
                  {whyChooseTitleLines[0]}
                  {whyChooseTitleLines[1] ? (
                    <>
                      {" "}
                      <span className="font-medium text-white/50">
                        {whyChooseTitleLines[1]}
                      </span>
                    </>
                  ) : null}
                </h2>
              ) : null}
              {whyChoose?.intro ? (
                <p className="text-white/60 font-light text-base sm:text-lg tracking-wide leading-relaxed mb-12 md:mb-16">
                  {whyChoose.intro}
                </p>
              ) : null}

              <div className="space-y-8 lg:space-y-12">
                {(whyChoose?.items ?? []).map((feature) => (
                  <div key={feature.title} className="flex gap-6 lg:gap-8 group">
                    <div className="flex-shrink-0 text-white/40 group-hover:text-white transition-colors mt-1 lg:mt-0">
                      {featureIconMap[feature.icon]}
                    </div>
                    <div>
                      <h4 className="font-display font-light uppercase tracking-[0.15em] text-xs lg:text-sm mb-2 lg:mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-white/50 font-light tracking-wide text-xs lg:text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[400px] lg:h-[800px] w-full relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-black/20 z-10" />
              {whyChoose?.image_url ? (
                <Image
                  src={whyChoose.image_url}
                  alt="Premium detail"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center grayscale-[0.4]"
                />
              ) : (
                <div className="absolute inset-0 bg-ink" />
              )}
              <div className="absolute inset-0 border border-white/10 z-20 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-40 relative flex items-center justify-center bg-[#050505] border-t border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container relative z-10 mx-auto px-6 max-w-4xl text-center">
          {cta?.badge ? (
            <div className="text-white/40 text-[10px] md:text-xs font-medium uppercase tracking-[0.3em] mb-6 md:mb-8">
              {cta.badge}
            </div>
          ) : null}
          {ctaTitleLines[0] ? (
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-light uppercase tracking-[0.05em] mb-6 md:mb-8 leading-tight">
              {ctaTitleLines[0]}
              {ctaTitleLines[1] ? (
                <>
                  <br />
                  {ctaTitleLines[1]}
                </>
              ) : null}
            </h2>
          ) : null}
          {cta?.subtitle ? (
            <p className="text-white/50 font-light tracking-wide text-base sm:text-lg mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              {cta.subtitle}
            </p>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full">
            {cta?.primary_cta_label && cta?.primary_cta_href ? (
              <Link
                href={cta.primary_cta_href}
                className="inline-block w-full sm:w-auto px-8 py-4 bg-white text-black text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
              >
                {cta.primary_cta_label}
              </Link>
            ) : null}
            {cta?.secondary_cta_label && cta?.secondary_cta_href ? (
              <Link
                href={cta.secondary_cta_href}
                className="inline-block w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
              >
                {cta.secondary_cta_label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
