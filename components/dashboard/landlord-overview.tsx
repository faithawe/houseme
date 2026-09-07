"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashPageHeader,
  DashPanel,
  DashPanelHead,
  StatusDot,
} from "@/components/dashboard/dash-primitives";
import {
  LANDLORD_DEMO_LISTINGS,
  summarizeLandlordBoard,
  type LandlordListingRow,
  type LandlordListingStatus,
} from "@/lib/landlord-demo";
import {
  formatNaira,
  formatPricePeriod,
  formatPropertyType,
} from "@/lib/utils";

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

function AttentionStrip({ listings }: { listings: LandlordListingRow[] }) {
  const needsWork = listings.filter(
    (listing) =>
      listing.status === "rejected" || listing.status === "pending_review",
  );

  if (needsWork.length === 0) {
    return (
      <DashPanel className="dash-enter-delay-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-sm font-semibold text-ink">Desk is clear</p>
            <p className="mt-0.5 text-xs text-navy-600">
              Nothing waiting on review or fixes right now.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/landlord/listings/new">Add a listing</Link>
          </Button>
        </div>
      </DashPanel>
    );
  }

  return (
    <DashPanel className="dash-enter-delay-2">
      <DashPanelHead
        title="Needs your attention"
        meta={`${needsWork.length} listing${needsWork.length === 1 ? "" : "s"} waiting`}
      />
      <ul>
        {needsWork.map((listing) => (
          <li
            key={listing.id}
            className="flex flex-col gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <StatusDot tone={statusTone[listing.status]} />
                <p className="truncate text-sm font-medium text-ink">
                  {listing.title}
                </p>
              </div>
              <p className="mt-1 text-xs text-navy-600">
                {statusLabel[listing.status]}
                {listing.rejectionReason
                  ? ` · ${listing.rejectionReason}`
                  : " · Waiting on HouseMe review"}
              </p>
            </div>
            <Button asChild size="sm" variant="stamp" className="shrink-0">
              <Link href={`/dashboard/landlord/listings/${listing.id}/edit`}>
                {listing.status === "rejected" ? "Fix & resubmit" : "Review draft"}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </DashPanel>
  );
}

function PulseStrip({
  live,
  pending,
  rejected,
  views,
  contacts,
}: {
  live: number;
  pending: number;
  rejected: number;
  views: number;
  contacts: number;
}) {
  const items = [
    { label: "Live", value: live, hint: "Visible now" },
    { label: "In review", value: pending, hint: "With HouseMe" },
    { label: "Needs fix", value: rejected, hint: "Edit required" },
    { label: "Views", value: views, hint: "Live listings" },
    { label: "Contacts", value: contacts, hint: "Calls / WhatsApp" },
  ];

  return (
    <div
      className="dash-enter-delay-1 grid grid-cols-2 gap-3 sm:grid-cols-5"
      role="list"
      aria-label="Listing board summary"
    >
      {items.map((item) => (
        <div
          key={item.label}
          role="listitem"
          className="min-w-0 rounded-xl border border-line bg-white px-3.5 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
            {item.label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {item.value}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-navy-400">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

function ListingRow({ listing }: { listing: LandlordListingRow }) {
  return (
    <li className="group grid gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center sm:px-5">
      <div className="relative h-[4.5rem] w-full overflow-hidden rounded-xl bg-line sm:h-14 sm:w-[4.5rem]">
        <Image
          src={listing.photo}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="72px"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-navy-600">
            <StatusDot tone={statusTone[listing.status]} />
            {statusLabel[listing.status]}
          </span>
          <span className="text-xs text-navy-400">
            {formatPropertyType(listing.propertyType)} · {listing.area},{" "}
            {listing.city}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-ink">
          {listing.title}
        </p>
        <p className="mt-0.5 text-sm text-navy-600">
          <span className="font-medium text-ink">
            {formatNaira(listing.price)}/{formatPricePeriod(listing.pricePeriod)}
          </span>
          {listing.status === "live" ? (
            <span className="text-navy-400">
              {" "}
              · {listing.viewCount} views · {listing.contactClicks} contacts
            </span>
          ) : null}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {listing.status === "live" ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/listings/${listing.id}`}>
              View
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="stamp" size="sm">
          <Link href={`/dashboard/landlord/listings/${listing.id}/edit`}>Edit</Link>
        </Button>
      </div>
    </li>
  );
}

export function LandlordOverview({ firstName }: { firstName: string }) {
  const [listings, setListings] = useState<LandlordListingRow[]>(LANDLORD_DEMO_LISTINGS);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/listings/mine");
        if (!response.ok) return;
        const json = (await response.json()) as {
          data: Array<{
            id: string;
            title: string;
            propertyType: LandlordListingRow["propertyType"];
            price: number;
            pricePeriod: LandlordListingRow["pricePeriod"];
            city: string;
            area: string | null;
            photos: { url: string }[];
            status: LandlordListingRow["status"];
            rejectionReason: string | null;
            viewCount: number;
            contactClicks: number;
            updatedAt: string;
          }>;
        };
        if (cancelled) return;
        setListings(
          json.data.map((listing) => ({
            id: listing.id,
            title: listing.title,
            propertyType: listing.propertyType,
            price: listing.price,
            pricePeriod: listing.pricePeriod,
            city: listing.city,
            area: listing.area || "—",
            photo: listing.photos[0]?.url || "/images/hero/living-room.jpg",
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
      } catch {
        // keep demo
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = summarizeLandlordBoard(listings);

  return (
    <div className="space-y-7">
      <DashPageHeader

        title={<>Good to see you, {firstName}</>}
        description="Track what tenants can see, fix anything rejected, and list the next room when you’re ready."
        actions={
          <Button asChild variant="stamp" className="gap-1.5">
            <Link href="/dashboard/landlord/listings/new">
              <Plus className="h-4 w-4" aria-hidden />
              List a property
            </Link>
          </Button>
        }
      />

      <PulseStrip {...summary} />
      <AttentionStrip listings={listings} />

      <DashPanel className="dash-enter-delay-3">
        <DashPanelHead
          title="Your listings"
          meta={`${listings.length} listing${listings.length === 1 ? "" : "s"}`}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/landlord/listings">Full list</Link>
            </Button>
          }
        />
        <ul>
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </ul>
      </DashPanel>

      <p className="text-xs leading-relaxed text-navy-400">
        Listings go live after HouseMe review. Tenants then call or WhatsApp you
        directly — no agent fee.
      </p>
    </div>
  );
}
