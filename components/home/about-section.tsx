import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedGlanceStats } from "@/components/home/animated-glance-stats";

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

          <AnimatedGlanceStats variant="overlay" />
        </div>
      </div>
    </section>
  );
}
