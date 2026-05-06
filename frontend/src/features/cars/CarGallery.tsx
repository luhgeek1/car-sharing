"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface CarGalleryProps {
  images: string[];
  alt: string;
}

export function CarGallery({ images, alt }: CarGalleryProps) {
  const total = images.length;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeIndex = total > 0 ? active % total : 0;
  const current = images[safeIndex];

  useEffect(() => {
    if (active >= total && total > 0) {
      setActive(0);
    }
  }, [active, total]);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    setActive((i) => (i - 1 + total) % total);
  }, [total]);
  const goNext = useCallback(() => {
    if (total === 0) return;
    setActive((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, goPrev, goNext]);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  if (total === 0) return null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-black">
        <button
          type="button"
          aria-label="Open gallery"
          onClick={() => setLightbox(true)}
          className="group relative block h-full w-full"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={current}
              alt={alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 border border-white/30 bg-black/55 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/85 opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" />
            View
          </span>
          <span className="pointer-events-none absolute bottom-4 right-4 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
            {safeIndex + 1} / {total}
          </span>
        </button>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative aspect-[4/3] overflow-hidden border transition-all ${
                i === safeIndex
                  ? "border-white"
                  : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/40"
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(min-width: 1024px) 12vw, (min-width: 640px) 16vw, 25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              aria-label="Close gallery"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(false);
              }}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <motion.img
              key={current}
              src={current}
              alt={alt}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-[92vw] object-contain"
            />

            <div className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-white/55">
              {safeIndex + 1} / {total}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
