import { CityChips, SearchBar } from "@/components/layout/search-bar";

export function HeroSearchSlip() {
  return (
    <div className="hero-slip hero-enter hero-enter-card mt-10 w-full rounded-xl border border-navy/10 bg-white p-6 text-ink shadow-[0_1px_2px_rgba(18,38,58,0.05),0_10px_28px_-8px_rgba(18,38,58,0.14),0_28px_56px_-20px_rgba(18,38,58,0.2)] sm:p-8">
      <div className="pt-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/55">
            Relocation slip
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-navy/35">
            Form HM-01
          </p>
        </div>
        <p className="mt-2 font-display text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-navy">
          Where are you moving?
        </p>
      </div>
      <div className="mt-6">
        <SearchBar layout="hero" />
      </div>
      <div className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
          Jump to a city
        </p>
        <CityChips scroll />
      </div>
    </div>
  );
}
