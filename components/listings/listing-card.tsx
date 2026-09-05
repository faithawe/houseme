import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Badge } from "@/components/ui/badge";
import type { DemoListing } from "@/lib/demo-listings";
import { formatNaira, formatPricePeriod, formatPropertyType } from "@/lib/utils";

export function ListingCard({ listing }: { listing: DemoListing }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-slip">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-photocopy">
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            className="object-cover transition duration-500 motion-safe:group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <span className="absolute -right-2 -top-2 z-10 flex h-16 w-16 rotate-12 items-center justify-center rounded-full border-2 border-stamp bg-white text-[9px] font-bold uppercase leading-tight text-stamp">
            Verified
          </span>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-2">
            <Badge>{formatPropertyType(listing.propertyType)}</Badge>
            <span className="text-xs text-navy/60">
              {listing.area}, {listing.city}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-ink group-hover:text-stamp">
            {listing.title}
          </h3>
          <p className="text-sm font-semibold text-ink">
            {formatNaira(listing.price)} / {formatPricePeriod(listing.pricePeriod)}
          </p>
        </div>
      </Link>
      <FavoriteButton listingId={listing.id} className="absolute left-3 top-3 z-10" />
    </article>
  );
}
