"use client";

import { getDemoListing } from "@/lib/demo-listings";
import { ListingGrid } from "@/components/listings/listing-grid";
import { useFavoriteIds } from "@/components/favorites/favorite-button";

export function SavedListings() {
  const ids = useFavoriteIds();
  const listings = ids
    .map((id) => getDemoListing(id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));

  if (ids.length === 0) {
    return (
      <ListingGrid
        listings={[]}
        emptyTitle="No saved listings yet"
        emptyDescription="Tap the heart on a listing card to save it here."
      />
    );
  }

  return <ListingGrid listings={listings} />;
}
