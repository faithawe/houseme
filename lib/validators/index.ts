import { z } from "zod";
import { PROPERTY_TYPES, PRICE_PERIODS } from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7, "Enter a valid phone number").max(20),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
  role: z.enum(["tenant", "landlord"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
});

const photoUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("data:image/") ||
      value.startsWith("/") ||
      value.startsWith("http://") ||
      value.startsWith("https://"),
    "Invalid photo URL",
  );

export const listingCreateSchema = z.object({
  title: z.string().min(10).max(150),
  description: z.string().min(50).max(2000),
  propertyType: z.enum(PROPERTY_TYPES),
  price: z.coerce.number().positive(),
  pricePeriod: z.enum(PRICE_PERIODS),
  city: z.string().min(2).max(100),
  area: z.string().max(100).optional(),
  address: z.string().min(5),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  furnished: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  photos: z.array(photoUrlSchema).min(1).max(6),
});

export const listingUpdateSchema = listingCreateSchema.partial().extend({
  photos: z.array(photoUrlSchema).min(1).max(6).optional(),
});

export const listingSearchSchema = z.object({
  q: z.string().optional().default(""),
  city: z.string().optional().default(""),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  furnished: z.coerce.boolean().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular"]).default("newest"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) =>
        value === null ||
        value === undefined ||
        value.startsWith("data:image/") ||
        value.startsWith("/") ||
        value.startsWith("https://") ||
        value.startsWith("http://"),
      "Invalid avatar URL",
    ),
  businessName: z.string().max(150).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
});

export const rejectListingSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
