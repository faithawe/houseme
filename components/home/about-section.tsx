import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const photos = [
  {
    src: "/images/about/apartment-interior.jpg",
    alt: "Bright apartment living room ready for tenants",
    className: "row-span-2 min-h-[18rem] lg:min-h-0",
  },
  {
    src: "/images/about/modern-living.jpg",
    alt: "Furnished flat with natural light",
    className: "min-h-[9rem]",
  },
  {
    src: "/images/about/kitchen.jpg",
    alt: "Compact kitchen in a self-contained unit",
    className: "min-h-[9rem]",
  },
];

const stats = [
  { value: "8+", label: "Cities covered" },
  { value: "100%", label: "Listings reviewed" },
  { value: "0%", label: "Agent fees on HouseMe" },
  { value: "Direct", label: "Phone & WhatsApp" },
];

export function AboutSection() {
  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
            About us
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            A national board for people relocating for school or service year.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-navy-600 md:text-base">
            HouseMe helps students, NYSC corps members, and interns find verified
            rooms and flats — and lets landlords list without an agent taking a cut.
            Every listing is reviewed before tenants see it.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/about">Learn more</Link>
          </Button>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3 pb-16 md:gap-4 md:grid-rows-2 lg:min-h-[22rem] lg:pb-14">
            {photos.map((photo) => (
              <div
                key={photo.src}
                className={`relative overflow-hidden rounded-xl bg-line ${photo.className}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 280px"
                />
              </div>
            ))}
          </div>

          <div
            aria-label="HouseMe at a glance"
            className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-slip sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white px-3 py-3.5 sm:px-3 sm:py-4">
                <p className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-navy-600 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
