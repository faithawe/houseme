/**
 * Full-text search + filters + pagination for live listings.
 */
import { and, asc, desc, eq, gte, inArray, isNull, lte, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { listingPhotos, listings, users } from "@/lib/db/schema";
import { ValidationError } from "@/lib/errors";
import { listingSearchSchema } from "@/lib/validators";
import type { ListingDto } from "@/lib/services/listing.service";

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export type SearchResult = {
  data: ListingDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const searchService = {
  async search(query: unknown): Promise<SearchResult> {
    const parsed = listingSearchSchema.safeParse(query);
    if (!parsed.success) {
      throw new ValidationError("Invalid search filters", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      q,
      city,
      minPrice,
      maxPrice,
      propertyType,
      furnished,
      bedrooms,
      page,
      limit,
      sort,
    } = parsed.data;

    const db = getDb();
    const conditions: SQL[] = [
      eq(listings.status, "live"),
      isNull(listings.deletedAt),
    ];

    if (q.trim()) {
      const term = q.trim();
      conditions.push(
        sql`(
          ${listings.searchVector} @@ plainto_tsquery('english', ${term})
          OR ${listings.title} ILIKE ${"%" + term + "%"}
          OR ${listings.city} ILIKE ${"%" + term + "%"}
          OR ${listings.area} ILIKE ${"%" + term + "%"}
        )`,
      );
    }
    if (city.trim()) conditions.push(eq(listings.city, city.trim()));
    if (propertyType) conditions.push(eq(listings.propertyType, propertyType));
    if (furnished !== undefined) conditions.push(eq(listings.furnished, furnished));
    if (bedrooms !== undefined) conditions.push(eq(listings.bedrooms, bedrooms));
    if (minPrice !== undefined) conditions.push(gte(listings.price, String(minPrice)));
    if (maxPrice !== undefined) conditions.push(lte(listings.price, String(maxPrice)));

    const where = and(...conditions);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(listings)
      .where(where);

    let orderBy;
    switch (sort) {
      case "price_asc":
        orderBy = asc(listings.price);
        break;
      case "price_desc":
        orderBy = desc(listings.price);
        break;
      case "popular":
        orderBy = desc(listings.contactClicks);
        break;
      default:
        orderBy = desc(listings.publishedAt);
    }

    const offset = (page - 1) * limit;
    const rows = await db
      .select({
        listing: listings,
        landlordName: users.name,
        phone: users.phone,
      })
      .from(listings)
      .innerJoin(users, eq(users.id, listings.landlordId))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const ids = rows.map((r) => r.listing.id);
    const photoRows =
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
    for (const photo of photoRows) {
      const list = photosByListing.get(photo.listingId) ?? [];
      list.push({
        id: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        sortOrder: photo.sortOrder,
      });
      photosByListing.set(photo.listingId, list);
    }

    const data: ListingDto[] = rows.map(({ listing, landlordName, phone }) => ({
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
      landlordName,
      phone,
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
