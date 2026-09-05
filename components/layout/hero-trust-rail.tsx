const TRUST_ITEMS = [
  "Every listing reviewed",
  "Direct landlord contact",
  "No agent platform fee",
] as const;

export function HeroTrustRail() {
  return (
    <div className="hero-enter hero-enter-rail relative z-10 border-t border-white/10 bg-navy/88 backdrop-blur-md">
      <div className="site-shell py-4 md:py-5">
        <div className="flex max-w-[33.75rem] flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
            Nationwide board
          </p>
          <p className="text-[13px] leading-relaxed text-white/75">
            {TRUST_ITEMS.join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
