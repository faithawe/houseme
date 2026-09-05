import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/search/empty-state";
import type { DemoListing } from "@/lib/demo-listings";

export function ListingGrid({
  listings,
  emptyTitle = "No listings match",
  emptyDescription = "Try another city or clear a filter.",
}: {
  listings: DemoListing[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (listings.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
