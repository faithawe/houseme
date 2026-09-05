export const LANDLORD_DRAFT_KEY = "houseme:landlord-listing-drafts";

export type LandlordDraftListing = {
  id: string;
  status: "pending_review";
  createdAt: string;
  title?: string;
  description?: string;
  propertyType?: string;
  price?: string | number;
  pricePeriod?: string;
  city?: string;
  area?: string;
  address?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  /** Cover-first photo URLs or compressed data URLs (demo store). */
  photos?: string[];
};

export function readLandlordDrafts(): LandlordDraftListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LANDLORD_DRAFT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LandlordDraftListing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLandlordDrafts(drafts: LandlordDraftListing[]) {
  window.localStorage.setItem(LANDLORD_DRAFT_KEY, JSON.stringify(drafts.slice(0, 20)));
}
