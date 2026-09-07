"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashPageHeader,
  DashPanel,
  DashPanelHead,
  StatusDot,
} from "@/components/dashboard/dash-primitives";
import {
  LANDLORD_DEMO_LISTINGS,
  type LandlordListingRow,
  type LandlordListingStatus,
} from "@/lib/landlord-demo";
import { readLandlordDrafts } from "@/lib/landlord-drafts";
import {
  formatNaira,
  formatPricePeriod,
  formatPropertyType,
} from "@/lib/utils";
import type { PricePeriod, PropertyType } from "@/lib/constants";

const PLACEHOLDER_PHOTO = "/images/hero/living-room.jpg";

const statusLabel: Record<LandlordListingStatus, string> = {
  live: "Live",
  pending_review: "In review",
  rejected: "Needs fix",
  draft: "Draft",
};

const statusTone: Record<
  LandlordListingStatus,
  "live" | "pending" | "rejected" | "draft"
> = {
  live: "live",
  pending_review: "pending",
  rejected: "rejected",
  draft: "draft",
};

function draftsAsRows(): LandlordListingRow[] {
  return readLandlordDrafts().map((draft) => ({
    id: draft.id,
    title: draft.title || "Untitled listing",
    propertyType: (draft.propertyType as PropertyType) || "self_con",
    price: Number(draft.price) || 0,
    pricePeriod: (draft.pricePeriod as PricePeriod) || "yearly",
    city: draft.city || "Lagos",
    area: draft.area || "—",
    photo: draft.photos?.[0] || PLACEHOLDER_PHOTO,
    status: "pending_review" as const,
    viewCount: 0,
    contactClicks: 0,
    updatedAt: draft.createdAt?.slice(0, 10) || "",
  }));
}

export function LandlordListingsBoard() {
  const [listings, setListings] = useState<LandlordListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/listings/mine");
        if (response.ok) {
          const json = (await response.json()) as {
            data: Array<{
              id: string;
              title: string;
              propertyType: PropertyType;
              price: number;
              pricePeriod: PricePeriod;
              city: string;
              area: string | null;
              photos: { url: string }[];
              status: LandlordListingStatus;
              rejectionReason: string | null;
              viewCount: number;
              contactClicks: number;
              updatedAt: string;
            }>;
          };
          if (!cancelled) {
            setListings(
              json.data.map((listing) => ({
                id: listing.id,
                title: listing.title,
                propertyType: listing.propertyType,
                price: listing.price,
                pricePeriod: listing.pricePeriod,
                city: listing.city,
                area: listing.area || "—",
                photo: listing.photos[0]?.url || PLACEHOLDER_PHOTO,
                status:
                  listing.status === "live" ||
                  listing.status === "pending_review" ||
                  listing.status === "rejected"
                    ? listing.status
                    : "draft",
                rejectionReason: listing.rejectionReason ?? undefined,
                viewCount: listing.viewCount,
                contactClicks: listing.contactClicks,
                updatedAt: listing.updatedAt.slice(0, 10),
              })),
            );
            setLoading(false);
            return;
          }
        }
      } catch {
        // fall through to demo
      }

      if (!cancelled) {
        setListings([...draftsAsRows(), ...LANDLORD_DEMO_LISTINGS]);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-line bg-white" />;
  }

  return (
    <div className="space-y-7">
      <DashPageHeader

        title="My listings"
        description="Everything live, waiting on review, or needing a fix before tenants can see it."
        actions={
          <Button asChild variant="stamp" className="gap-1.5">
            <Link href="/dashboard/landlord/listings/new">
              <Plus className="h-4 w-4" aria-hidden />
              New listing
            </Link>
          </Button>
        }
      />

      <DashPanel>
        <DashPanelHead
          title="All listings"
          meta={`${listings.length} total`}
        />
        <div className="hidden grid-cols-[1fr_7.5rem_5rem_5.5rem_6.5rem] gap-3 border-b border-line bg-[#fafafa] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400 md:grid">
          <span>Listing</span>
          <span>Status</span>
          <span>Views</span>
          <span>Contacts</span>
          <span className="text-right">Action</span>
        </div>
        <ul>
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="grid gap-3 border-b border-line px-4 py-3.5 last:border-b-0 md:grid-cols-[1fr_7.5rem_5rem_5.5rem_6.5rem] md:items-center md:px-5"
            >
              <div className="flex min-w-0 gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-line">
                  {listing.photo.startsWith("data:") ||
                  listing.photo.startsWith("blob:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={listing.photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {listing.title}
                  </p>
                  <p className="mt-0.5 text-xs text-navy-600">
                    {formatPropertyType(listing.propertyType)} · {listing.area}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {formatNaira(listing.price)}/
                    {formatPricePeriod(listing.pricePeriod)}
                  </p>
                  {listing.rejectionReason ? (
                    <p className="mt-1 text-xs text-stamp-700 md:hidden">
                      {listing.rejectionReason}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-navy-600">
                <StatusDot tone={statusTone[listing.status]} />
                {statusLabel[listing.status]}
              </div>
              <p className="text-sm tabular-nums text-navy-600 md:text-ink">
                <span className="md:hidden">Views: </span>
                {listing.viewCount}
              </p>
              <p className="text-sm tabular-nums text-navy-600 md:text-ink">
                <span className="md:hidden">Contacts: </span>
                {listing.contactClicks}
              </p>
              <div className="flex md:justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/landlord/listings/${listing.id}/edit`}>
                    Edit
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </DashPanel>
    </div>
  );
}
