import type { DemoListing } from "@/lib/demo-listings";
import {
  getDemoListing,
  getFeaturedListings,
  searchDemoListings,
  type DemoSearchParams,
} from "@/lib/demo-listings";
import { hasDatabaseUrl } from "@/lib/db";
import type { ListingDto } from "@/lib/services/listing.service";
import { listingService } from "@/lib/services/listing.service";
import { searchService } from "@/lib/services/search.service";

export function toCardListing(listing: ListingDto): DemoListing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    propertyType: listing.propertyType,
    price: listing.price,
    pricePeriod: listing.pricePeriod,
    city: listing.city,
    area: listing.area ?? "",
    address: listing.address,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnished: listing.furnished,
    amenities: (listing.amenities ?? []) as DemoListing["amenities"],
    photos: listing.photos.map((p) => p.url),
    landlordName: listing.landlordName ?? "Landlord",
    phone: listing.phone ?? "",
    publishedAt: (listing.publishedAt ?? listing.createdAt).slice(0, 10),
    viewCount: listing.viewCount,
    contactClicks: listing.contactClicks,
  };
}

export async function getPublicFeatured(limit = 6): Promise<DemoListing[]> {
  if (!hasDatabaseUrl()) return getFeaturedListings(limit);
  try {
    const result = await searchService.search({
      sort: "popular",
      limit,
      page: 1,
    });
    if (result.data.length === 0) return getFeaturedListings(limit);
    return result.data.map(toCardListing);
  } catch {
    return getFeaturedListings(limit);
  }
}

export async function getPublicListing(id: string): Promise<DemoListing | null> {
  if (!hasDatabaseUrl()) return getDemoListing(id) ?? null;
  try {
    const listing = await listingService.getById(id, { bumpView: true });
    if (listing) return toCardListing(listing);
  } catch {
    // fall through to demo
  }
  return getDemoListing(id) ?? null;
}

export async function searchPublicListings(
  params: DemoSearchParams,
): Promise<DemoListing[]> {
  if (!hasDatabaseUrl()) return searchDemoListings(params);
  try {
    const result = await searchService.search({
      q: params.q ?? "",
      city: params.city ?? "",
      propertyType: params.propertyType || undefined,
      furnished:
        params.furnished === "true"
          ? true
          : params.furnished === "false"
            ? false
            : undefined,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: (params.sort as "newest" | "price_asc" | "price_desc" | "popular") || "newest",
      page: 1,
      limit: 50,
    });
    if (result.pagination.total === 0 && !params.q && !params.city) {
      return searchDemoListings(params);
    }
    return result.data.map(toCardListing);
  } catch {
    return searchDemoListings(params);
  }
}
