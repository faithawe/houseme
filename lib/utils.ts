import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PricePeriod, PropertyType } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPricePeriod(period: PricePeriod): string {
  return period === "yearly" ? "year" : "month";
}

export function formatPropertyType(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    self_con: "Self-con",
    room: "Room",
    flat: "Flat",
    mini_flat: "Mini-flat",
    bungalow: "Bungalow",
    duplex: "Duplex",
  };
  return labels[type];
}
