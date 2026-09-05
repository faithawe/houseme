import Image from "next/image";
import { MarqueeCard } from "@/components/ui/marquee-card";

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden
      >
        <Image
          src="/images/about/cityscape.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
          From the board
        </p>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Built for people moving for school, service, or work
        </h2>
      </div>

      <div className="relative mt-10">
        <MarqueeCard />
      </div>
    </section>
  );
}
