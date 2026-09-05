import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FEATURED_CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPropertyType } from "@/lib/utils";

export function HeroSearchBar() {
  return (
    <section
      aria-label="Search listings"
      className="relative z-20 -mt-14 px-4 md:-mt-16"
    >
      <form
        action="/search"
        method="get"
        className="mx-auto grid max-w-6xl gap-3 rounded-2xl border border-line bg-white p-3 shadow-slip md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:gap-4 md:p-4"
      >
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400">
            Location
          </span>
          <Select name="city" defaultValue="">
            <option value="">Any city</option>
            {FEATURED_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400">
            Property type
          </span>
          <Select name="propertyType" defaultValue="">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatPropertyType(type)}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400">
            Budget
          </span>
          <Select name="maxPrice" defaultValue="">
            <option value="">Any budget</option>
            <option value="300000">Under ₦300k / year</option>
            <option value="500000">Under ₦500k / year</option>
            <option value="800000">Under ₦800k / year</option>
            <option value="1500000">Under ₦1.5m / year</option>
          </Select>
        </label>
        <Button type="submit" variant="navy" className="h-11 gap-2 md:min-w-[10.5rem]">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </form>
      <p className="mx-auto mt-3 max-w-6xl text-center text-xs text-navy-400 md:text-left">
        Looking to list instead?{" "}
        <Link href="/dashboard/landlord/listings/new" className="underline hover:text-ink">
          List your property
        </Link>
      </p>
    </section>
  );
}
