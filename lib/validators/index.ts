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

export const listingCreateSchema = z.object({
  title: z.string().min(10).max(150),
  description: z.string().min(50).max(2000),
  propertyType: z.enum(PROPERTY_TYPES),
  price: z.number().positive(),
  pricePeriod: z.enum(PRICE_PERIODS),
  city: z.string().min(2).max(100),
  area: z.string().max(100).optional(),
  address: z.string().min(5),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  furnished: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
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

export const rejectListingSchema = z.object({
  reason: z.string().min(10).max(1000),
});
