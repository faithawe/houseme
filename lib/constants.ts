export const APP_NAME = "HouseMe";
export const APP_TAGLINE = "Find verified housing without the agent stress.";

export const PROPERTY_TYPES = [
  "self_con",
  "room",
  "flat",
  "mini_flat",
  "bungalow",
  "duplex",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PRICE_PERIODS = ["monthly", "yearly"] as const;
export type PricePeriod = (typeof PRICE_PERIODS)[number];

export const LISTING_STATUSES = [
  "pending_review",
  "live",
  "rejected",
  "soft_deleted",
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const USER_ROLES = ["tenant", "landlord", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AMENITIES = [
  "water",
  "power",
  "parking",
  "security",
  "wifi",
  "kitchen",
  "prepaid_meter",
  "generator",
] as const;

export const AMENITY_LABELS: Record<(typeof AMENITIES)[number], string> = {
  water: "Running water",
  power: "Power",
  parking: "Parking",
  security: "Security",
  wifi: "Wi‑Fi",
  kitchen: "Kitchen",
  prepaid_meter: "Prepaid meter",
  generator: "Generator",
};

export const FEATURED_CITIES = [
  "Lagos",
  "Abuja",
  "Jos",
  "Ibadan",
  "Port Harcourt",
  "Kano",
  "Enugu",
  "Kaduna",
] as const;

export const CRITICAL_LISTING_FIELDS = [
  "title",
  "description",
  "price",
  "address",
  "propertyType",
] as const;
