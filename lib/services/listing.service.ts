/**
 * Listing CRUD, status transitions, and hybrid live-edit rules
 * (critical fields re-enter pending_review — see ADR-008).
 */
import { and, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { CRITICAL_LISTING_FIELDS } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { listingPhotos, listings, users } from "@/lib/db/schema";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  listingCreateSchema,
  listingUpdateSchema,
} from "@/lib/validators";
import { geocodingService } from "@/lib/services/geocoding.service";

export type ListingPhotoDto = {
  id: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
};

export type ListingDto = {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: (typeof listings.$inferSelect)["propertyType"];
  price: number;
  pricePeriod: (typeof listings.$inferSelect)["pricePeriod"];
  city: string;
  area: string | null;
  address: string;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  amenities: string[];
  status: (typeof listings.$inferSelect)["status"];
  rejectionReason: string | null;
  contactClicks: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: ListingPhotoDto[];
  landlordName?: string;
  phone?: string;
};

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function mapListing(
  row: typeof listings.$inferSelect,
  photos: ListingPhotoDto[],
  landlord?: { name: string; phone: string },
): ListingDto {
  return {
    id: row.id,
    landlordId: row.landlordId,
    title: row.title,
    description: row.description,
    propertyType: row.propertyType,
    price: toNumber(row.price),
    pricePeriod: row.pricePeriod,
    city: row.city,
    area: row.area,
    address: row.address,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnished: row.furnished,
    amenities: row.amenities ?? [],
    status: row.status,
    rejectionReason: row.rejectionReason,
    contactClicks: row.contactClicks,
    viewCount: row.viewCount,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    photos,
    landlordName: landlord?.name,
    phone: landlord?.phone,
  };
}

async function loadPhotos(listingIds: string[]) {
  if (listingIds.length === 0) return new Map<string, ListingPhotoDto[]>();
  const db = getDb();
  const rows = await db
    .select()
    .from(listingPhotos)
    .where(inArray(listingPhotos.listingId, listingIds))
    .orderBy(listingPhotos.sortOrder);

  const map = new Map<string, ListingPhotoDto[]>();
  for (const row of rows) {
    const list = map.get(row.listingId) ?? [];
    list.push({
      id: row.id,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
      sortOrder: row.sortOrder,
    });
    map.set(row.listingId, list);
  }
  return map;
}

async function replacePhotos(listingId: string, photoUrls: string[]) {
  const db = getDb();
  await db.delete(listingPhotos).where(eq(listingPhotos.listingId, listingId));
  if (photoUrls.length === 0) return;
  await db.insert(listingPhotos).values(
    photoUrls.map((url, index) => ({
      listingId,
      url,
      thumbnailUrl: url,
      sortOrder: index,
    })),
  );
}

function criticalFieldChanged(
  current: typeof listings.$inferSelect,
  patch: Record<string, unknown>,
): boolean {
  for (const field of CRITICAL_LISTING_FIELDS) {
    if (!(field in patch)) continue;
    const next = patch[field];
    if (field === "price") {
      if (toNumber(current.price) !== toNumber(next as string | number)) return true;
      continue;
    }
    if (current[field] !== next) return true;
  }
  return false;
}

export const listingService = {
  async create(landlordId: string, input: unknown): Promise<ListingDto> {
    const parsed = listingCreateSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid listing details", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const db = getDb();
    const geo = await geocodingService.geocode(data.address, data.city);

    const [row] = await db
      .insert(listings)
      .values({
        landlordId,
        title: data.title.trim(),
        description: data.description.trim(),
        propertyType: data.propertyType,
        price: String(data.price),
        pricePeriod: data.pricePeriod,
        city: data.city.trim(),
        area: data.area?.trim() || null,
        address: data.address.trim(),
        latitude: String(geo.latitude),
        longitude: String(geo.longitude),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        furnished: data.furnished,
        amenities: data.amenities,
        status: "pending_review",
      })
      .returning();

    await replacePhotos(row.id, data.photos);
    const photos = (await loadPhotos([row.id])).get(row.id) ?? [];
    return mapListing(row, photos);
  },

  async update(id: string, landlordId: string, input: unknown): Promise<ListingDto> {
    const parsed = listingUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid listing details", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const db = getDb();
    const [current] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, id), isNull(listings.deletedAt)))
      .limit(1);

    if (!current) throw new NotFoundError("Listing not found");
    if (current.landlordId !== landlordId) throw new ForbiddenError();
    if (current.status === "soft_deleted") throw new NotFoundError("Listing not found");

    const data = parsed.data;
    const patch: Partial<typeof listings.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) patch.title = data.title.trim();
    if (data.description !== undefined) patch.description = data.description.trim();
    if (data.propertyType !== undefined) patch.propertyType = data.propertyType;
    if (data.price !== undefined) patch.price = String(data.price);
    if (data.pricePeriod !== undefined) patch.pricePeriod = data.pricePeriod;
    if (data.city !== undefined) patch.city = data.city.trim();
    if (data.area !== undefined) patch.area = data.area.trim() || null;
    if (data.address !== undefined) patch.address = data.address.trim();
    if (data.bedrooms !== undefined) patch.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) patch.bathrooms = data.bathrooms;
    if (data.furnished !== undefined) patch.furnished = data.furnished;
    if (data.amenities !== undefined) patch.amenities = data.amenities;

    if (
      data.address !== undefined ||
      data.city !== undefined
    ) {
      const geo = await geocodingService.geocode(
        (data.address ?? current.address).trim(),
        (data.city ?? current.city).trim(),
      );
      patch.latitude = String(geo.latitude);
      patch.longitude = String(geo.longitude);
    }

    if (
      current.status === "live" &&
      criticalFieldChanged(current, data as Record<string, unknown>)
    ) {
      patch.status = "pending_review";
      patch.publishedAt = null;
      patch.rejectionReason = null;
    } else if (current.status === "rejected") {
      patch.status = "pending_review";
      patch.rejectionReason = null;
    }

    const [row] = await db
      .update(listings)
      .set(patch)
      .where(eq(listings.id, id))
      .returning();

    if (data.photos) {
      await replacePhotos(id, data.photos);
    }

    const photos = (await loadPhotos([id])).get(id) ?? [];
    return mapListing(row, photos);
  },

  async softDelete(id: string, landlordId: string): Promise<{ id: string }> {
    const db = getDb();
    const [current] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, id), isNull(listings.deletedAt)))
      .limit(1);

    if (!current) throw new NotFoundError("Listing not found");
    if (current.landlordId !== landlordId) throw new ForbiddenError();

    await db
      .update(listings)
      .set({
        status: "soft_deleted",
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id));

    return { id };
  },

  async getById(
    id: string,
    options?: { includeNonLive?: boolean; bumpView?: boolean },
  ): Promise<ListingDto | null> {
    const db = getDb();
    const conditions = [eq(listings.id, id), isNull(listings.deletedAt)];
    if (!options?.includeNonLive) {
      conditions.push(eq(listings.status, "live"));
    }

    const [row] = await db
      .select()
      .from(listings)
      .where(and(...conditions))
      .limit(1);

    if (!row) return null;

    if (options?.bumpView && row.status === "live") {
      const { analyticsService } = await import("@/lib/services/analytics.service");
      await analyticsService.trackView(id);
      row.viewCount += 1;
    }

    const [landlord] = await db
      .select({ name: users.name, phone: users.phone })
      .from(users)
      .where(eq(users.id, row.landlordId))
      .limit(1);

    const photos = (await loadPhotos([id])).get(id) ?? [];
    return mapListing(row, photos, landlord);
  },

  async listMine(landlordId: string): Promise<ListingDto[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.landlordId, landlordId),
          isNull(listings.deletedAt),
          ne(listings.status, "soft_deleted"),
        ),
      )
      .orderBy(desc(listings.updatedAt));

    const photosMap = await loadPhotos(rows.map((r) => r.id));
    return rows.map((row) => mapListing(row, photosMap.get(row.id) ?? []));
  },

  async recordContact(id: string, userId?: string | null, userAgent?: string | null) {
    const { analyticsService } = await import("@/lib/services/analytics.service");
    await analyticsService.trackContact(id, userId, userAgent);
    return { ok: true };
  },

  async addPhotos(id: string, landlordId: string, urls: string[]) {
    if (!urls.length) throw new ValidationError("Add at least one photo");
    const listing = await this.getById(id, { includeNonLive: true });
    if (!listing) throw new NotFoundError("Listing not found");
    if (listing.landlordId !== landlordId) throw new ForbiddenError();

    const existing = listing.photos;
    if (existing.length + urls.length > 6) {
      throw new ValidationError("A listing can have at most 6 photos");
    }

    const db = getDb();
    await db.insert(listingPhotos).values(
      urls.map((url, index) => ({
        listingId: id,
        url,
        thumbnailUrl: url,
        sortOrder: existing.length + index,
      })),
    );

    return this.getById(id, { includeNonLive: true });
  },

  async deletePhoto(id: string, landlordId: string, photoId: string) {
    const listing = await this.getById(id, { includeNonLive: true });
    if (!listing) throw new NotFoundError("Listing not found");
    if (listing.landlordId !== landlordId) throw new ForbiddenError();
    if (listing.photos.length <= 1) {
      throw new ValidationError("A listing needs at least one photo");
    }

    const db = getDb();
    await db
      .delete(listingPhotos)
      .where(and(eq(listingPhotos.id, photoId), eq(listingPhotos.listingId, id)));

    return this.getById(id, { includeNonLive: true });
  },

  async reorderPhotos(id: string, landlordId: string, photoIds: string[]) {
    const listing = await this.getById(id, { includeNonLive: true });
    if (!listing) throw new NotFoundError("Listing not found");
    if (listing.landlordId !== landlordId) throw new ForbiddenError();

    const db = getDb();
    for (const [index, photoId] of photoIds.entries()) {
      await db
        .update(listingPhotos)
        .set({ sortOrder: index })
        .where(and(eq(listingPhotos.id, photoId), eq(listingPhotos.listingId, id)));
    }

    return this.getById(id, { includeNonLive: true });
  },
};
