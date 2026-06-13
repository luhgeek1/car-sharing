"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getCar } from "@/shared/api/cars";
import { CarGallery } from "@/features/cars/CarGallery";

const formatPrice = (price: string | number) => {
  const num = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(num)) return String(price);
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export default function CarDetailClient() {
  const { id } = useParams<{ id: string }>();

  const { data: car, isLoading, isError } = useQuery({
    queryKey: ["cars", id],
    queryFn: () => getCar(id),
  });

  if (isLoading) {
    return (
      <div className="w-full pt-32 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-white/40 text-sm">Loading…</div>
        </div>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="w-full pt-32 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-red-300 text-sm">Vehicle not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-32 pb-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors mb-10"
        >
          ← Back to fleet
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-10 lg:gap-16">
          <div>
            <CarGallery images={car.images} alt={car.name} />
          </div>

          <div className="flex flex-col gap-8 lg:pt-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
                <span>{car.category}</span>
                <span className="text-white/15">·</span>
                <span>{car.year}</span>
                <span className="text-white/15">·</span>
                {car.is_available ? (
                  <span className="text-white/85">Available</span>
                ) : (
                  <span className="text-white/40">Booked</span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-light uppercase tracking-[0.05em] leading-tight text-white">
                {car.name}
              </h1>

              <p className="text-white/55 font-light tracking-wide leading-relaxed">
                {car.brand} · {car.model}
              </p>
            </div>

            <p className="text-white/65 font-light leading-relaxed text-base md:text-lg tracking-wide">
              {car.description || "Premium vehicle, ready for your next moment."}
            </p>

            {car.highlights.length > 0 ? (
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40 pb-4 border-b border-white/5 mb-5">
                  Highlights
                </h4>
                <ul className="space-y-3">
                  {car.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-xs font-light text-white/75 tracking-wide flex items-center"
                    >
                      <span className="inline-block h-px w-3 bg-white/40 mr-4" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border-t border-white/10 pt-6">
              <div className="text-3xl font-display font-light tracking-[0.05em] text-white">
                {formatPrice(car.price_per_day)}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40 mt-1">
                Per day
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/contact?car=${car.id}`}
                className="px-8 py-4 bg-white text-black text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/90 transition-colors text-center"
              >
                Check Availability
              </Link>
              <Link
                href="/fleet"
                className="px-8 py-4 bg-transparent border border-white/30 text-white text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all text-center"
              >
                See more vehicles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
