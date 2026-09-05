"use client";

import {
  adminListingFromDraft,
  buildAdminReviewListings,
  type AdminListingStatus,
  type AdminReviewListing,
} from "@/lib/admin-demo";
import { readLandlordDrafts } from "@/lib/landlord-drafts";

export const ADMIN_REVIEW_KEY = "houseme:admin-reviews";
export const ADMIN_REVIEW_EVENT = "houseme:admin-reviews";

export type ReviewOverride = {
  status: AdminListingStatus;
  rejectionReason?: string;
  reviewedAt: string;
};

function readOverrides(): Record<string, ReviewOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ADMIN_REVIEW_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ReviewOverride>;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, ReviewOverride>) {
  window.localStorage.setItem(ADMIN_REVIEW_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event(ADMIN_REVIEW_EVENT));
}

export function setListingReview(
  listingId: string,
  status: AdminListingStatus,
  rejectionReason?: string,
) {
  const overrides = readOverrides();
  overrides[listingId] = {
    status,
    rejectionReason: status === "rejected" ? rejectionReason : undefined,
    reviewedAt: new Date().toISOString(),
  };
  writeOverrides(overrides);
}

function applyOverrides(listings: AdminReviewListing[]): AdminReviewListing[] {
  const overrides = readOverrides();
  return listings.map((listing) => {
    const override = overrides[listing.id];
    if (!override) return listing;
    return {
      ...listing,
      status: override.status,
      rejectionReason: override.rejectionReason ?? listing.rejectionReason,
      reviewedAt: override.reviewedAt,
    };
  });
}

/** Merge demo listings, landlord drafts, and admin review overrides. */
export function readAdminReviewListings(): AdminReviewListing[] {
  const base = buildAdminReviewListings();
  const draftRows = readLandlordDrafts().map(adminListingFromDraft);
  const byId = new Map<string, AdminReviewListing>();

  for (const listing of base) byId.set(listing.id, listing);
  for (const draft of draftRows) {
    if (!byId.has(draft.id)) byId.set(draft.id, draft);
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt),
  );

  return applyOverrides(merged);
}

export function getAdminReviewListingById(id: string): AdminReviewListing | null {
  return readAdminReviewListings().find((listing) => listing.id === id) ?? null;
}

export { ADMIN_REVIEW_EVENT as adminReviewEvent };
