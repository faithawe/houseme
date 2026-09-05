import Image from "next/image";
import { HeroIntro } from "@/components/layout/hero-intro";
import { HeroTrustRail } from "@/components/layout/hero-trust-rail";

const HERO_IMAGE = "/images/hero/living-room.jpg";

/**
 * Structural references (21st.dev — adapted, not copied):
 * - Real Estate Search Hero: search-forward layout + image mask into page
 * - Hero Gradient with Search: dark gradient zone + search as primary action
 * HouseMe keeps left-aligned postal/relocation voice, navy/stamp palette,
 * and a relocation-slip card instead of a centered pill bar.
 */
export function Hero() {
  return (
    <section id="site-hero" className="relative bg-navy text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="hero-photo-zoom absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Sunlit living room with a sofa, plants, and a coffee table"
            fill
            priority
            unoptimized
            className="object-cover object-[center_42%] lg:object-[62%_42%]"
            sizes="100vw"
          />
        </div>
        <div className="hero-veil pointer-events-none absolute inset-0" />
        <div className="hero-image-fade pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-36" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        {/* Split: copy + slip on the left; photo reads through the right via the veil */}
        <div className="site-shell flex flex-1 items-center pt-[4.75rem] pb-14 md:pb-16">
          <div className="w-full lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5 xl:col-span-5">
              <HeroIntro />
            </div>
          </div>
        </div>

        <HeroTrustRail />
      </div>
    </section>
  );
}
