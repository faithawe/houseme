import Link from "next/link";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { HeroSearchBar } from "@/components/home/hero-search-bar";
import { TrustStrip } from "@/components/home/trust-strip";
import { AboutSection } from "@/components/home/about-section";
import { ServicesSection } from "@/components/home/services-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ListingGrid } from "@/components/listings/listing-grid";
import { Button } from "@/components/ui/button";
import { getPublicFeatured } from "@/lib/listings/public";

export default async function HomePage() {
  const featured = await getPublicFeatured(3);

  return (
    <div>
      <AnimatedHero />
      <HeroSearchBar />
      <TrustStrip />
      <AboutSection />

      <section className="border-t border-line bg-white px-4 py-16 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
              Featured
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Verified rooms ready to view
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/search">View all listings</Link>
          </Button>
        </div>
        <div className="mx-auto mt-10 max-w-6xl">
          <ListingGrid listings={featured} />
        </div>
      </section>

      <ServicesSection />
      <TestimonialsSection />
    </div>
  );
}
