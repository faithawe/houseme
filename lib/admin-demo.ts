import type { PricePeriod, PropertyType, UserRole } from "@/lib/constants";
import { DEMO_LISTINGS, getDemoListing } from "@/lib/demo-listings";
import { LANDLORD_DEMO_LISTINGS } from "@/lib/landlord-demo";

export type AdminListingStatus = "pending_review" | "live" | "rejected";

export type AdminReviewListing = {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  pricePeriod: PricePeriod;
  city: string;
  area: string;
  address: string;
  photo: string | null;
  photos: string[];
  status: AdminListingStatus;
  rejectionReason?: string | null;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  submittedAt: string;
  reviewedAt?: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  joinedAt: string;
  lastActive: string;
  listingsCount: number;
  status: "active" | "flagged";
};

const landlordEmail = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@landlords.houseme.ng`;

/** Base review queue from demo listings + landlord board seeds. */
export function buildAdminReviewListings(): AdminReviewListing[] {
  const statusById: Record<string, AdminListingStatus> = {};
  const rejectionById: Record<string, string> = {};

  for (const row of LANDLORD_DEMO_LISTINGS) {
    if (row.status === "live" || row.status === "pending_review" || row.status === "rejected") {
      statusById[row.id] = row.status;
      if (row.rejectionReason) rejectionById[row.id] = row.rejectionReason;
    }
  }

  // Extra submissions waiting in queue
  const pendingIds = ["bodija-self-con", "enugu-independence-selfcon", "ph-gra-flat"];
  for (const id of pendingIds) {
    if (!statusById[id]) statusById[id] = "pending_review";
  }

  const reviewedIds = new Set(Object.keys(statusById));

  return DEMO_LISTINGS.filter((listing) => reviewedIds.has(listing.id)).map((listing) => {
    const status = statusById[listing.id] ?? "pending_review";
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      propertyType: listing.propertyType,
      price: listing.price,
      pricePeriod: listing.pricePeriod,
      city: listing.city,
      area: listing.area,
      address: listing.address,
      photo: listing.photos[0],
      photos: listing.photos,
      status,
      rejectionReason: rejectionById[listing.id],
      landlordName: listing.landlordName,
      landlordEmail: landlordEmail(listing.landlordName),
      landlordPhone: listing.phone,
      submittedAt: listing.publishedAt,
    };
  }).sort(
    (a, b) =>
      Date.parse(b.submittedAt) - Date.parse(a.submittedAt),
  );
}

export function adminListingFromDraft(draft: {
  id: string;
  title?: string;
  description?: string;
  propertyType?: string;
  price?: string | number;
  pricePeriod?: string;
  city?: string;
  area?: string;
  address?: string;
  photos?: string[];
  createdAt?: string;
}): AdminReviewListing {
  const photos = draft.photos?.length ? draft.photos : [];
  const placeholder = "/images/hero/living-room.jpg";
  return {
    id: draft.id,
    title: draft.title || "Untitled listing",
    description: draft.description || "Submitted from landlord draft on this device.",
    propertyType: (draft.propertyType as PropertyType) || "self_con",
    price: Number(draft.price) || 0,
    pricePeriod: (draft.pricePeriod as PricePeriod) || "yearly",
    city: draft.city || "Lagos",
    area: draft.area || "—",
    address: draft.address || "—",
    photo: photos[0] || placeholder,
    photos: photos.length ? photos : [placeholder],
    status: "pending_review",
    landlordName: "Demo Landlord",
    landlordEmail: "landlord@houseme.ng",
    landlordPhone: "+2348000000002",
    submittedAt: draft.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  };
}

export function getAdminReviewListing(id: string): AdminReviewListing | null {
  const base = buildAdminReviewListings().find((listing) => listing.id === id);
  if (base) return base;
  const demo = getDemoListing(id);
  if (!demo) return null;
  return {
    id: demo.id,
    title: demo.title,
    description: demo.description,
    propertyType: demo.propertyType,
    price: demo.price,
    pricePeriod: demo.pricePeriod,
    city: demo.city,
    area: demo.area,
    address: demo.address,
    photo: demo.photos[0],
    photos: demo.photos,
    status: "pending_review",
    landlordName: demo.landlordName,
    landlordEmail: landlordEmail(demo.landlordName),
    landlordPhone: demo.phone,
    submittedAt: demo.publishedAt,
  };
}

export const ADMIN_DEMO_USERS: AdminUserRow[] = [
  {
    id: "tenant-demo",
    name: "Demo Tenant",
    email: "tenant@houseme.ng",
    phone: "+2348000000001",
    role: "tenant",
    joinedAt: "2026-06-01",
    lastActive: "2026-08-30",
    listingsCount: 0,
    status: "active",
  },
  {
    id: "landlord-demo",
    name: "Demo Landlord",
    email: "landlord@houseme.ng",
    phone: "+2348000000002",
    role: "landlord",
    joinedAt: "2026-05-12",
    lastActive: "2026-08-31",
    listingsCount: 3,
    status: "active",
  },
  {
    id: "admin-demo",
    name: "HouseMe Admin",
    email: "admin@houseme.ng",
    phone: "+2348000000003",
    role: "admin",
    joinedAt: "2026-01-10",
    lastActive: "2026-08-31",
    listingsCount: 0,
    status: "active",
  },
  {
    id: "ll-chioma",
    name: "Chioma A.",
    email: "chioma.a@landlords.houseme.ng",
    phone: "+2348012345601",
    role: "landlord",
    joinedAt: "2026-04-18",
    lastActive: "2026-08-28",
    listingsCount: 1,
    status: "active",
  },
  {
    id: "ll-tunde",
    name: "Tunde B.",
    email: "tunde.b@landlords.houseme.ng",
    phone: "+2348023456702",
    role: "landlord",
    joinedAt: "2026-03-22",
    lastActive: "2026-08-27",
    listingsCount: 1,
    status: "active",
  },
  {
    id: "ll-hauwa",
    name: "Hauwa M.",
    email: "hauwa.m@landlords.houseme.ng",
    phone: "+2348034567803",
    role: "landlord",
    joinedAt: "2026-02-14",
    lastActive: "2026-08-25",
    listingsCount: 1,
    status: "flagged",
  },
  {
    id: "tn-amaka",
    name: "Amaka E.",
    email: "amaka.e@tenants.houseme.ng",
    phone: "+2348101234567",
    role: "tenant",
    joinedAt: "2026-07-03",
    lastActive: "2026-08-29",
    listingsCount: 0,
    status: "active",
  },
  {
    id: "tn-yusuf",
    name: "Yusuf I.",
    email: "yusuf.i@tenants.houseme.ng",
    phone: "+2348112345678",
    role: "tenant",
    joinedAt: "2026-07-19",
    lastActive: "2026-08-26",
    listingsCount: 0,
    status: "active",
  },
  {
    id: "tn-grace",
    name: "Grace O.",
    email: "grace.o@tenants.houseme.ng",
    phone: "+2348123456789",
    role: "tenant",
    joinedAt: "2026-08-01",
    lastActive: "2026-08-30",
    listingsCount: 0,
    status: "active",
  },
];

export function summarizeAdminBoard(listings: AdminReviewListing[]) {
  const pending = listings.filter((l) => l.status === "pending_review");
  const live = listings.filter((l) => l.status === "live");
  const rejected = listings.filter((l) => l.status === "rejected");
  const contacts = live.reduce((sum, l) => {
    const demo = getDemoListing(l.id);
    return sum + (demo?.contactClicks ?? 0);
  }, 0);

  return {
    pending: pending.length,
    live: live.length,
    rejected: rejected.length,
    total: listings.length,
    contacts,
  };
}

export function summarizeAdminUsers(users: AdminUserRow[]) {
  return {
    tenants: users.filter((u) => u.role === "tenant").length,
    landlords: users.filter((u) => u.role === "landlord").length,
    flagged: users.filter((u) => u.status === "flagged").length,
    total: users.filter((u) => u.role !== "admin").length,
  };
}
