import { HeroSearchSlip } from "@/components/layout/hero-search-slip";

export function HeroIntro() {
  return (
    <div className="w-full max-w-[33.75rem] md:max-w-[min(33.75rem,52%)]">
      <p className="hero-badge hero-enter hero-enter-badge inline-flex items-center border border-stamp/40 bg-navy/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stamp backdrop-blur-[2px]">
        Reviewed before it goes live
      </p>
      <h1 className="hero-headline hero-enter hero-enter-headline mt-6 font-display text-[clamp(2rem,3.6vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.032em] text-white">
        <span className="block">Your posting letter</span>
        <span className="block">found the city.</span>
        <span className="block">
          We find <span className="text-stamp">the room.</span>
        </span>
      </h1>
      <p className="hero-headline hero-enter hero-enter-sub mt-6 max-w-[26rem] text-[15px] leading-[1.65] text-white/84 md:text-base">
        Verified rooms and flats for students, NYSC corps members, and interns
        relocating across Nigeria — without the agent fee.
      </p>
      <HeroSearchSlip />
    </div>
  );
}
