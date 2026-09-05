import type { PricePeriod, PropertyType } from "@/lib/constants";
import { AMENITIES } from "@/lib/constants";

export type DemoListing = {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  pricePeriod: PricePeriod;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  amenities: (typeof AMENITIES)[number][];
  photos: string[];
  landlordName: string;
  phone: string;
  publishedAt: string;
  viewCount: number;
  contactClicks: number;
};

const photo = (name: string) => `/images/listings/${name}.jpg`;

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: "lekki-self-con",
    title: "Sunny self-con near Lekki Phase 1",
    description:
      "A compact self-contained apartment for a student or intern who wants to be close to work on the island. Tiled floors, a kitchenette, and prepaid meter. Water runs most days; generator covers the evenings.",
    propertyType: "self_con",
    price: 850000,
    pricePeriod: "yearly",
    city: "Lagos",
    area: "Lekki Phase 1",
    address: "12 Admiralty Road, Lekki Phase 1, Lagos",
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    amenities: ["water", "power", "wifi", "kitchen", "prepaid_meter", "security"],
    photos: [photo("lekki-1"), photo("lekki-2"), photo("lekki-3")],
    landlordName: "Chioma A.",
    phone: "+2348012345601",
    publishedAt: "2026-08-12",
    viewCount: 214,
    contactClicks: 41,
  },
  {
    id: "yaba-room",
    title: "Shared flat room in Yaba, walking distance to Unilag",
    description:
      "A private room in a quiet compound off Herbert Macaulay. Shared kitchen and lounge with two other tenants. Good for a student who wants to stay close to campus without paying island rent.",
    propertyType: "room",
    price: 280000,
    pricePeriod: "yearly",
    city: "Lagos",
    area: "Yaba",
    address: "18 Hughes Avenue, Yaba, Lagos",
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    amenities: ["water", "kitchen", "security", "prepaid_meter"],
    photos: [photo("yaba-1"), photo("yaba-2"), photo("yaba-3")],
    landlordName: "Tunde B.",
    phone: "+2348023456702",
    publishedAt: "2026-08-08",
    viewCount: 331,
    contactClicks: 67,
  },
  {
    id: "gwarinpa-flat",
    title: "2-bedroom flat in Gwarinpa for corps members",
    description:
      "A tidy two-bedroom on the ground floor of a gated street. Neighbours are mostly civil servants and NYSC members. Borehole water, DSTV dish already mounted, and space for a small generator.",
    propertyType: "flat",
    price: 1200000,
    pricePeriod: "yearly",
    city: "Abuja",
    area: "Gwarinpa",
    address: "Plot 441, 1st Avenue, Gwarinpa, Abuja",
    bedrooms: 2,
    bathrooms: 2,
    furnished: false,
    amenities: ["water", "power", "parking", "security", "kitchen", "generator"],
    photos: [photo("abuja-1"), photo("abuja-2"), photo("abuja-3")],
    landlordName: "Hauwa M.",
    phone: "+2348034567803",
    publishedAt: "2026-08-15",
    viewCount: 188,
    contactClicks: 29,
  },
  {
    id: "jos-unijos-room",
    title: "Room and parlour near University of Jos",
    description:
      "A room-and-parlour on the Naraguta side of town. Ten minutes to the University of Jos by keke. Cool plateau weather, fenced compound, and a landlord who lives next door. Built for students and newly posted corps members.",
    propertyType: "mini_flat",
    price: 350000,
    pricePeriod: "yearly",
    city: "Jos",
    area: "Naraguta",
    address: "Behind Terminus Market Road, Naraguta, Jos",
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    amenities: ["water", "kitchen", "security", "wifi"],
    photos: [photo("jos-1"), photo("jos-2"), photo("jos-3")],
    landlordName: "Nankling D.",
    phone: "+2348045678904",
    publishedAt: "2026-08-18",
    viewCount: 96,
    contactClicks: 18,
  },
  {
    id: "bodija-self-con",
    title: "Self-con in Bodija, close to UI gate",
    description:
      "Newly painted self-contained unit on a side street off Bodija market. Students from the University of Ibadan use this street. Kitchen sink,wardrobe, and a small veranda for laundry.",
    propertyType: "self_con",
    price: 400000,
    pricePeriod: "yearly",
    city: "Ibadan",
    area: "Bodija",
    address: "7 Awolowo Avenue, Bodija, Ibadan",
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    amenities: ["water", "kitchen", "prepaid_meter", "security"],
    photos: [photo("ibadan-1"), photo("ibadan-2"), photo("ibadan-3")],
    landlordName: "Ifeoluwa K.",
    phone: "+2348056789005",
    publishedAt: "2026-08-04",
    viewCount: 142,
    contactClicks: 22,
  },
  {
    id: "ph-gra-flat",
    title: "Mini-flat in Port Harcourt GRA",
    description:
      "A one-bedroom mini-flat with a sitting room that can take a work desk. Street is motorable in the rains. Suitable for an intern attached to a company in Trans Amadi who still wants a quiet night.",
    propertyType: "mini_flat",
    price: 700000,
    pricePeriod: "yearly",
    city: "Port Harcourt",
    area: "GRA Phase 2",
    address: "14 Tombia Street, GRA Phase 2, Port Harcourt",
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    amenities: ["water", "power", "parking", "wifi", "kitchen", "security", "generator"],
    photos: [photo("ph-1"), photo("ph-2"), photo("ph-3")],
    landlordName: "Ebiye J.",
    phone: "+2348067890106",
    publishedAt: "2026-08-11",
    viewCount: 121,
    contactClicks: 19,
  },
  {
    id: "kano-nassarawa-room",
    title: "Single room in Nassarawa GRA, Kano",
    description:
      "A single room in a family house with an external kitchen. The street is close to shops and a mosque. Landlord prefers a female tenant or a corps member with a guarantor in Kano.",
    propertyType: "room",
    price: 180000,
    pricePeriod: "yearly",
    city: "Kano",
    area: "Nassarawa",
    address: "Off Zoo Road, Nassarawa GRA, Kano",
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    amenities: ["water", "kitchen", "security"],
    photos: [photo("kano-1"), photo("kano-2"), photo("kano-3")],
    landlordName: "Amina S.",
    phone: "+2348078901207",
    publishedAt: "2026-08-01",
    viewCount: 77,
    contactClicks: 11,
  },
  {
    id: "enugu-independence-selfcon",
    title: "Self-con in Independence Layout, Enugu",
    description:
      "Upstairs self-contained with a view of the hills. Cool evenings, borehole in the compound, and a short trip to New Market. Interns at the teaching hospital have stayed here before.",
    propertyType: "self_con",
    price: 450000,
    pricePeriod: "yearly",
    city: "Enugu",
    area: "Independence Layout",
    address: "22 Umuezebi Street, Independence Layout, Enugu",
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    amenities: ["water", "wifi", "kitchen", "security", "prepaid_meter"],
    photos: [photo("enugu-1"), photo("enugu-2"), photo("enugu-3")],
    landlordName: "Chukwuemeka O.",
    phone: "+2348089012308",
    publishedAt: "2026-08-16",
    viewCount: 64,
    contactClicks: 9,
  },
  {
    id: "kaduna-barnawa-bungalow",
    title: "2-bedroom bungalow in Barnawa, Kaduna",
    description:
      "A small bungalow with a fenced yard. Two bedrooms, one sitting room, and a kitchen that already has a gas cylinder cage. Better for two friends posting together than a single corps member.",
    propertyType: "bungalow",
    price: 900000,
    pricePeriod: "yearly",
    city: "Kaduna",
    area: "Barnawa",
    address: "8 Aliyu Makama Road, Barnawa, Kaduna",
    bedrooms: 2,
    bathrooms: 1,
    furnished: false,
    amenities: ["water", "parking", "kitchen", "security", "generator"],
    photos: [photo("kaduna-1"), photo("kaduna-2"), photo("kaduna-3")],
    landlordName: "Yusuf L.",
    phone: "+2348090123409",
    publishedAt: "2026-07-28",
    viewCount: 54,
    contactClicks: 7,
  },
];

export function getDemoListing(id: string) {
  return DEMO_LISTINGS.find((listing) => listing.id === id);
}

export function getFeaturedListings(limit = 6) {
  return [...DEMO_LISTINGS]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export type DemoSearchParams = {
  q?: string;
  city?: string;
  propertyType?: string;
  furnished?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export function searchDemoListings(params: DemoSearchParams) {
  const q = params.q?.trim().toLowerCase() ?? "";
  const city = params.city?.trim() ?? "";
  const propertyType = params.propertyType?.trim() ?? "";
  const furnished =
    params.furnished === "true" ? true : params.furnished === "false" ? false : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : Number.POSITIVE_INFINITY;

  let results = DEMO_LISTINGS.filter((listing) => {
    const haystack = `${listing.title} ${listing.city} ${listing.area} ${listing.description}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    const matchesCity = !city || listing.city === city;
    const matchesType = !propertyType || listing.propertyType === propertyType;
    const matchesFurnished = furnished === undefined || listing.furnished === furnished;
    const matchesPrice = listing.price >= minPrice && listing.price <= maxPrice;
    return matchesQuery && matchesCity && matchesType && matchesFurnished && matchesPrice;
  });

  switch (params.sort) {
    case "price_asc":
      results = results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results = results.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      results = results.sort((a, b) => b.contactClicks - a.contactClicks);
      break;
    default:
      results = results.sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
      );
  }

  return results;
}
