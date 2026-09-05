import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FEATURED_CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SearchBar({
  compact = false,
  layout = "default",
  defaultQuery = "",
  defaultCity = "",
}: {
  compact?: boolean;
  layout?: "default" | "card" | "hero";
  defaultQuery?: string;
  defaultCity?: string;
}) {
  if (layout === "hero") {
    return (
      <form
        action="/search"
        className="overflow-hidden rounded-xl border border-line bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus-within:border-stamp/50 focus-within:ring-2 focus-within:ring-stamp/25"
      >
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <Input
            name="q"
            placeholder="Area, landmark, or city"
            aria-label="Search listings"
            defaultValue={defaultQuery}
            className="h-12 rounded-none border-0 border-b border-line shadow-none focus-visible:border-stamp focus-visible:ring-0 sm:flex-1 sm:border-b-0"
          />
          <div aria-hidden="true" className="hidden w-px shrink-0 bg-line sm:block" />
          <Select
            name="city"
            defaultValue={defaultCity}
            aria-label="City"
            className="h-12 rounded-none border-0 border-b border-line shadow-none focus-visible:border-stamp focus-visible:ring-0 sm:w-[9.5rem] sm:border-b-0"
          >
            <option value="">All cities</option>
            {FEATURED_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Button
            type="submit"
            variant="navy"
            className="h-12 rounded-none px-6 focus-visible:ring-offset-0 sm:shrink-0"
          >
            Search
          </Button>
        </div>
      </form>
    );
  }

  const formClass = compact
    ? "flex w-full gap-2"
    : layout === "card"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
      : "grid gap-3 md:grid-cols-[1fr_180px_auto]";

  return (
    <form action="/search" className={formClass}>
      <Input
        name="q"
        placeholder="Area, landmark, or city"
        aria-label="Search listings"
        defaultValue={defaultQuery}
        className={layout === "card" ? "sm:col-span-2" : undefined}
      />
      {!compact ? (
        <Select name="city" defaultValue={defaultCity} aria-label="City">
          <option value="">All cities</option>
          {FEATURED_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      ) : null}
      <Button type="submit" variant="navy">
        Search
      </Button>
    </form>
  );
}

export function CityChips({
  active,
  scroll = false,
}: {
  active?: string;
  scroll?: boolean;
}) {
  return (
    <div
      className={
        scroll
          ? "hero-city-scroll -mx-1 px-1 py-1"
          : "flex flex-wrap gap-2"
      }
    >
      {FEATURED_CITIES.map((city) => (
        <Link
          key={city}
          href={`/search?city=${encodeURIComponent(city)}`}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-xs font-medium transition-[border-color,color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/45 focus-visible:ring-offset-2",
            scroll && "shrink-0",
            active === city
              ? "border-stamp bg-stamp text-white hover:border-stamp-700 hover:bg-stamp-700"
              : "border-line bg-white text-navy hover:border-navy/30 hover:bg-slip",
          )}
        >
          {city}
        </Link>
      ))}
    </div>
  );
}
