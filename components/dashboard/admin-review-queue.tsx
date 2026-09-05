"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DashPageHeader,
  DashPanel,
  DashPanelHead,
  StatusDot,
} from "@/components/dashboard/dash-primitives";
import type { AdminReviewListing } from "@/lib/admin-demo";
import {
  ADMIN_REVIEW_EVENT,
  readAdminReviewListings,
} from "@/lib/admin-review-store";
import {
  formatNaira,
  formatPricePeriod,
  formatPropertyType,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

type Filter = "all" | "pending" | "live" | "rejected";

const statusLabel = {
  live: "Live",
  pending_review: "In review",
  rejected: "Rejected",
} as const;

const statusTone = {
  live: "live",
  pending_review: "pending",
  rejected: "rejected",
} as const;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "In review" },
  { id: "live", label: "Live" },
  { id: "rejected", label: "Rejected" },
];

function filterListings(listings: AdminReviewListing[], filter: Filter) {
  if (filter === "all") return listings;
  if (filter === "pending") {
    return listings.filter((l) => l.status === "pending_review");
  }
  if (filter === "live") return listings.filter((l) => l.status === "live");
  return listings.filter((l) => l.status === "rejected");
}

export function AdminReviewQueue() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as Filter) || "all";
  const [listings, setListings] = useState<AdminReviewListing[]>([]);
  const [filter, setFilter] = useState<Filter>(
    filters.some((f) => f.id === initialFilter) ? initialFilter : "all",
  );

  useEffect(() => {
    const sync = () => setListings(readAdminReviewListings());
    sync();
    window.addEventListener(ADMIN_REVIEW_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ADMIN_REVIEW_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const visible = useMemo(
    () => filterListings(listings, filter),
    [listings, filter],
  );

  return (
    <div className="space-y-7">
      <DashPageHeader

        title="Listing reviews"
        description="Approve verified homes, reject with a clear reason, or reopen rejected listings."
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              filter === item.id
                ? "bg-ink text-white"
                : "border border-line bg-white text-navy-600 hover:text-ink",
            )}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums text-xs opacity-70">
              {filterListings(listings, item.id).length}
            </span>
          </button>
        ))}
      </div>

      <DashPanel>
        <DashPanelHead
          title="Submissions"
          meta={`${visible.length} listing${visible.length === 1 ? "" : "s"}`}
        />
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-navy-600 sm:px-5">
            No listings in this filter.
          </p>
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_7rem_6.5rem_6rem] gap-3 border-b border-line bg-[#fafafa] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400 md:grid">
              <span>Listing</span>
              <span>Status</span>
              <span>Landlord</span>
              <span className="text-right">Action</span>
            </div>
            <ul>
              {visible.map((listing) => (
                <li
                  key={listing.id}
                  className="grid gap-3 border-b border-line px-4 py-3.5 last:border-b-0 md:grid-cols-[1fr_7rem_6.5rem_6rem] md:items-center md:px-5"
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-line">
                      {listing.photo.startsWith("data:") ? (
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
                        {formatPropertyType(listing.propertyType)} · {listing.area},{" "}
                        {listing.city}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-ink">
                        {formatNaira(listing.price)}/
                        {formatPricePeriod(listing.pricePeriod)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-navy-600">
                    <StatusDot tone={statusTone[listing.status]} />
                    {statusLabel[listing.status]}
                  </div>
                  <p className="truncate text-sm text-navy-600">{listing.landlordName}</p>
                  <div className="flex md:justify-end">
                    <Button asChild size="sm" variant="stamp">
                      <Link href={`/dashboard/admin/listings/${listing.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </DashPanel>
    </div>
  );
}
