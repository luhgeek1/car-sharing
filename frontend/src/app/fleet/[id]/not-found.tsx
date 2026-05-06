import Link from "next/link";

import { Button } from "@/shared/components/ui/button";

export default function CarNotFound() {
  return (
    <div className="bg-black">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-32 text-center">
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
          Vehicle not found
        </div>
        <h1 className="font-display text-4xl font-light uppercase tracking-[0.05em] text-white">
          That ride is out of the lineup.
        </h1>
        <p className="text-white/65">
          The vehicle you’re looking for may be unavailable or no longer in our
          fleet. Take a look at what we have available right now.
        </p>
        <Button asChild className="bg-white text-black hover:bg-white/90">
          <Link href="/fleet">Browse the fleet</Link>
        </Button>
      </section>
    </div>
  );
}
