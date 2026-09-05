import type { PricePeriod, PropertyType } from "@/lib/constants";
import { DEMO_LISTINGS } from "@/lib/demo-listings";

export type LandlordListingStatus =
  | "live"
  | "pending_review"
  | "rejected"
  | "draft";

export type LandlordListingRow = {
  id: string;
  title: string;
  propertyType: PropertyType;
  price: number;
  pricePeriod: PricePeriod;
  city: string;
  area: string;
  photo: string;
  status: LandlordListingStatus;
  rejectionReason?: string;
  viewCount: number;
  contactClicks: number;
  updatedAt: string;
};

/** Demo portfolio for the landlord board until `/api/listings/mine` is live. */
export const LANDLORD_DEMO_LISTINGS: LandlordListingRow[] = [
  {
    id: DEMO_LISTINGS[0].id,
    title: DEMO_LISTINGS[0].title,
    propertyType: DEMO_LISTINGS[0].propertyType,
    price: DEMO_LISTINGS[0].price,
    pricePeriod: DEMO_LISTINGS[0].pricePeriod,
    city: DEMO_LISTINGS[0].city,
    area: DEMO_LISTINGS[0].area,
    photo: DEMO_LISTINGS[0].photos[0],
    status: "live",
    viewCount: DEMO_LISTINGS[0].viewCount,
    contactClicks: DEMO_LISTINGS[0].contactClicks,
    updatedAt: "2026-08-20",
  },
  {
    id: DEMO_LISTINGS[1].id,
    title: DEMO_LISTINGS[1].title,
    propertyType: DEMO_LISTINGS[1].propertyType,
    price: DEMO_LISTINGS[1].price,
    pricePeriod: DEMO_LISTINGS[1].pricePeriod,
    city: DEMO_LISTINGS[1].city,
    area: DEMO_LISTINGS[1].area,
    photo: DEMO_LISTINGS[1].photos[0],
    status: "pending_review",
    viewCount: 0,
    contactClicks: 0,
    updatedAt: "2026-08-22",
  },
  {
    id: DEMO_LISTINGS[2]?.id ?? "abuja-flat",
    title: DEMO_LISTINGS[2]?.title ?? "Quiet mini-flat near Wuse market",
    propertyType: DEMO_LISTINGS[2]?.propertyType ?? "mini_flat",
    price: DEMO_LISTINGS[2]?.price ?? 650000,
    pricePeriod: DEMO_LISTINGS[2]?.pricePeriod ?? "yearly",
    city: DEMO_LISTINGS[2]?.city ?? "Abuja",
    area: DEMO_LISTINGS[2]?.area ?? "Wuse",
    photo:
      DEMO_LISTINGS[2]?.photos[0] ?? "/images/hero/living-room.jpg",
    status: "rejected",
    rejectionReason: "Add clearer photos of the kitchen and bathroom.",
    viewCount: 12,
    contactClicks: 0,
    updatedAt: "2026-08-18",
  },
];

export function summarizeLandlordBoard(listings: LandlordListingRow[]) {
  const live = listings.filter((l) => l.status === "live");
  const pending = listings.filter((l) => l.status === "pending_review");
  const rejected = listings.filter((l) => l.status === "rejected");
  return {
    live: live.length,
    pending: pending.length,
    rejected: rejected.length,
    views: live.reduce((sum, l) => sum + l.viewCount, 0),
    contacts: live.reduce((sum, l) => sum + l.contactClicks, 0),
  };
}
