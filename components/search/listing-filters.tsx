"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FEATURED_CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPropertyType } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-2 lg:grid-cols-6">
      <Select
        aria-label="Property type"
        value={searchParams.get("propertyType") ?? ""}
        onChange={(event) => update("propertyType", event.target.value)}
      >
        <option value="">All types</option>
        {PROPERTY_TYPES.map((type) => (
          <option key={type} value={type}>
            {formatPropertyType(type)}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Furnished"
        value={searchParams.get("furnished") ?? ""}
        onChange={(event) => update("furnished", event.target.value)}
      >
        <option value="">Furnished or not</option>
        <option value="true">Furnished</option>
        <option value="false">Unfurnished</option>
      </Select>
      <Input
        type="number"
        min={0}
        placeholder="Min ₦"
        aria-label="Minimum price"
        defaultValue={searchParams.get("minPrice") ?? ""}
        onBlur={(event) => update("minPrice", event.target.value)}
      />
      <Input
        type="number"
        min={0}
        placeholder="Max ₦"
        aria-label="Maximum price"
        defaultValue={searchParams.get("maxPrice") ?? ""}
        onBlur={(event) => update("maxPrice", event.target.value)}
      />
      <Select
        aria-label="Sort"
        value={searchParams.get("sort") ?? "newest"}
        onChange={(event) => update("sort", event.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="popular">Most contacted</option>
      </Select>
      <Select
        aria-label="City"
        value={searchParams.get("city") ?? ""}
        onChange={(event) => update("city", event.target.value)}
      >
        <option value="">All cities</option>
        {FEATURED_CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </Select>
    </div>
  );
}
