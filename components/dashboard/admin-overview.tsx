"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashPageHeader,
  DashPanel,
  DashPanelHead,
  StatusDot,
} from "@/components/dashboard/dash-primitives";
import {
  ADMIN_DEMO_USERS,
  summarizeAdminBoard,
  summarizeAdminUsers,
  type AdminReviewListing,
} from "@/lib/admin-demo";
import {
  ADMIN_REVIEW_EVENT,
  readAdminReviewListings,
} from "@/lib/admin-review-store";

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

function StatCards({
  pending,
  live,
  rejected,
  total,
  contacts,
}: {
  pending: number;
  live: number;
  rejected: number;
  total: number;
  contacts: number;
}) {
  const items = [
    { label: "In review", value: pending, hint: "Needs decision" },
    { label: "Live", value: live, hint: "On the board" },
    { label: "Rejected", value: rejected, hint: "Sent back" },
    { label: "Total tracked", value: total, hint: "This queue" },
    { label: "Contacts (7d)", value: contacts, hint: "Live listings" },
  ];

  return (
    <div
      className="dash-enter-delay-1 grid grid-cols-2 gap-3 sm:grid-cols-5"
      role="list"
      aria-label="Admin board summary"
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

function QueuePreviewRow({ listing }: { listing: AdminReviewListing }) {
  return (
    <li className="flex flex-col gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-line">
          {listing.photo.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Image src={listing.photo} alt="" fill className="object-cover" sizes="56px" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot tone={statusTone[listing.status]} />
            <p className="truncate text-sm font-medium text-ink">{listing.title}</p>
          </div>
          <p className="mt-1 text-xs text-navy-600">
            {statusLabel[listing.status]} · {listing.landlordName} · {listing.city}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="stamp" className="shrink-0">
        <Link href={`/dashboard/admin/listings/${listing.id}`}>Review</Link>
      </Button>
    </li>
  );
}

export function AdminOverview({ firstName }: { firstName: string }) {
  const [listings, setListings] = useState<AdminReviewListing[]>([]);
  const userStats = summarizeAdminUsers(ADMIN_DEMO_USERS);

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

  const stats = summarizeAdminBoard(listings);
  const pending = listings.filter((l) => l.status === "pending_review").slice(0, 4);

  return (
    <div className="space-y-7">
      <DashPageHeader

        title={<>Welcome back, {firstName}</>}
        description="Review new listings, keep the board clean, and monitor tenants and landlords on HouseMe."
        actions={
          <Button asChild variant="stamp" className="gap-1.5">
            <Link href="/dashboard/admin/listings">
              <ClipboardList className="h-4 w-4" aria-hidden />
              Open queue
            </Link>
          </Button>
        }
      />

      <StatCards {...stats} />

      <div className="grid gap-3 sm:grid-cols-2">
        <DashPanel>
          <div className="px-4 py-4 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
              Users on board
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
              {userStats.total}
            </p>
            <p className="mt-1 text-xs text-navy-600">
              {userStats.tenants} tenants · {userStats.landlords} landlords
              {userStats.flagged ? ` · ${userStats.flagged} flagged` : ""}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
              <Link href="/dashboard/admin/users">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Monitor users
              </Link>
            </Button>
          </div>
        </DashPanel>
        <DashPanel>
          <div className="px-4 py-4 sm:px-5">
            <p className="text-sm font-semibold text-ink">Queue priority</p>
            <p className="mt-1 text-xs text-navy-600">
              {stats.pending
                ? `${stats.pending} listing${stats.pending === 1 ? "" : "s"} waiting for a decision.`
                : "No listings waiting — queue is clear."}
            </p>
            {stats.pending ? (
              <Button asChild variant="stamp" size="sm" className="mt-3">
                <Link href="/dashboard/admin/listings?filter=pending">
                  Review now
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            ) : null}
          </div>
        </DashPanel>
      </div>

      <DashPanel className="dash-enter-delay-2">
        <DashPanelHead
          title="Review queue"
          meta={stats.pending ? `${stats.pending} pending` : "Nothing pending"}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/admin/listings">Full queue</Link>
            </Button>
          }
        />
        {pending.length === 0 ? (
          <p className="px-4 py-8 text-sm text-navy-600 sm:px-5">
            No listings waiting for review right now.
          </p>
        ) : (
          <ul>
            {pending.map((listing) => (
              <QueuePreviewRow key={listing.id} listing={listing} />
            ))}
          </ul>
        )}
      </DashPanel>
    </div>
  );
}
