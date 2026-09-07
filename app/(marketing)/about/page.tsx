import type { Metadata } from "next";
import Image from "next/image";
import { AnimatedGlanceStats } from "@/components/home/animated-glance-stats";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="space-y-8">
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
          About
        </p>
        <h1 className="font-display text-4xl font-semibold text-navy">
          Housing you can trust when you relocate
        </h1>
        <div className="relative aspect-[16/8] overflow-hidden rounded-xl">
          <Image
            src="/images/about/apartment-interior.jpg"
            alt="A bright apartment living room"
            fill
            className="object-cover"
            sizes="768px"
          />
        </div>
        <p className="text-navy/75">
          Students, NYSC corps members, and interns moving for school or work often
          pay agents for unverified rooms. HouseMe is a national listing board where
          landlords post directly and every listing is reviewed before it is public.
        </p>
        <p className="text-navy/75">
          We start with phone contact and admin review — not chat, not paid boosts,
          not native apps. Trust first, then growth.
        </p>
      </div>

      <AnimatedGlanceStats variant="panel" />
    </article>
  );
}
