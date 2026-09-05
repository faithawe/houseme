import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/layout/search-bar";
import { ListingGrid } from "@/components/listings/listing-grid";
import { SearchFilters } from "@/components/search/listing-filters";
import { searchDemoListings } from "@/lib/demo-listings";

export const metadata: Metadata = { title: "Search listings" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const city = typeof params.city === "string" ? params.city : "";
  const propertyType = typeof params.propertyType === "string" ? params.propertyType : "";
  const furnished = typeof params.furnished === "string" ? params.furnished : "";
  const minPrice = typeof params.minPrice === "string" ? params.minPrice : "";
  const maxPrice = typeof params.maxPrice === "string" ? params.maxPrice : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  const listings = searchDemoListings({
    q,
    city,
    propertyType,
    furnished,
    minPrice,
    maxPrice,
    sort,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-navy">Search</h1>
      <p className="mt-1 text-sm text-navy/60">
        {listings.length} verified sample listing{listings.length === 1 ? "" : "s"}. Filters
        update instantly.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-white p-4">
        <SearchBar defaultQuery={q} defaultCity={city} />
      </div>
      <div className="mt-4">
        <Suspense>
          <SearchFilters />
        </Suspense>
      </div>
      <div className="mt-8">
        <ListingGrid
          listings={listings}
          emptyTitle="No listings found"
          emptyDescription="Try another city, raise the budget, or clear a filter."
        />
      </div>
    </div>
  );
}
