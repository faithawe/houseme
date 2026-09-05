import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { AmenityList } from "@/components/listings/amenity-list";
import { ContactCta } from "@/components/listings/contact-cta";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_LISTINGS, getDemoListing } from "@/lib/demo-listings";
import { formatNaira, formatPricePeriod, formatPropertyType } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return DEMO_LISTINGS.map((listing) => ({ id: listing.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = getDemoListing(id);
  if (!listing) return { title: "Listing" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = getDemoListing(id);
  if (!listing) notFound();

  const mapQuery = encodeURIComponent(`${listing.address}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/search">Back to search</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge>{formatPropertyType(listing.propertyType)}</Badge>
          {listing.furnished ? <Badge variant="palm">Furnished</Badge> : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <ListingGallery title={listing.title} photos={listing.photos} />
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-navy/60">
                {listing.area}, {listing.city}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
                {listing.title}
              </h1>
              <p className="mt-2 font-display text-2xl font-semibold text-palm">
                {formatNaira(listing.price)} / {formatPricePeriod(listing.pricePeriod)}
              </p>
            </div>
            <FavoriteButton listingId={listing.id} className="relative border border-line" />
          </div>
          <p className="mt-4 text-navy/75">{listing.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-white p-3">
              <dt className="text-navy/50">Bedrooms</dt>
              <dd className="font-semibold text-navy">{listing.bedrooms}</dd>
            </div>
            <div className="rounded-xl bg-white p-3">
              <dt className="text-navy/50">Bathrooms</dt>
              <dd className="font-semibold text-navy">{listing.bathrooms}</dd>
            </div>
            <div className="rounded-xl bg-white p-3">
              <dt className="text-navy/50">Type</dt>
              <dd className="font-semibold text-navy">
                {formatPropertyType(listing.propertyType)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3">
              <dt className="text-navy/50">Address</dt>
              <dd className="font-semibold text-navy">{listing.address}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-navy">Amenities</h2>
            <div className="mt-3">
              <AmenityList amenities={listing.amenities} />
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ContactCta phone={listing.phone} landlordName={listing.landlordName} />
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <iframe
              title={`Map of ${listing.area}, ${listing.city}`}
              className="h-64 w-full"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
