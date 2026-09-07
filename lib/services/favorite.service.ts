/**
 * Save, unsave, and list a user's favorite listings.
 */
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { favorites, listingPhotos, listings } from "@/lib/db/schema";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { ListingDto } from "@/lib/services/listing.service";

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export const favoriteService = {
  async list(userId: string): Promise<ListingDto[]> {
    const db = getDb();
    const rows = await db
      .select({ listing: listings })
      .from(favorites)
      .innerJoin(listings, eq(listings.id, favorites.listingId))
      .where(
        and(
          eq(favorites.userId, userId),
          eq(listings.status, "live"),
        ),
      )
      .orderBy(desc(favorites.createdAt));

    const ids = rows.map((r) => r.listing.id);
    const allPhotos =
      ids.length === 0
        ? []
        : await db
            .select()
            .from(listingPhotos)
            .where(inArray(listingPhotos.listingId, ids))
            .orderBy(listingPhotos.sortOrder);

    const photosByListing = new Map<
      string,
      { id: string; url: string; thumbnailUrl: string; sortOrder: number }[]
    >();
    for (const photo of allPhotos) {
      const list = photosByListing.get(photo.listingId) ?? [];
      list.push({
        id: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        sortOrder: photo.sortOrder,
      });
      photosByListing.set(photo.listingId, list);
    }

    return rows.map(({ listing }) => ({
      id: listing.id,
      landlordId: listing.landlordId,
      title: listing.title,
      description: listing.description,
      propertyType: listing.propertyType,
      price: toNumber(listing.price),
      pricePeriod: listing.pricePeriod,
      city: listing.city,
      area: listing.area,
      address: listing.address,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      furnished: listing.furnished,
      amenities: listing.amenities ?? [],
      status: listing.status,
      rejectionReason: listing.rejectionReason,
      contactClicks: listing.contactClicks,
      viewCount: listing.viewCount,
      publishedAt: listing.publishedAt?.toISOString() ?? null,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      photos: photosByListing.get(listing.id) ?? [],
    }));
  },

  async listIds(userId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db
      .select({ listingId: favorites.listingId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return rows.map((r) => r.listingId);
  },

  async save(userId: string, listingId: string) {
    const db = getDb();
    const [listing] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.status, "live")))
      .limit(1);

    if (!listing) throw new NotFoundError("Listing not found");

    try {
      await db.insert(favorites).values({ userId, listingId });
    } catch {
      throw new ConflictError("Listing already saved");
    }

    return { listingId };
  },

  async unsave(userId: string, listingId: string) {
    const db = getDb();
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return { listingId };
  },
};
