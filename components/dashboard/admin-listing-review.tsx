"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DashPageHeader,
  DashPanel,
} from "@/components/dashboard/dash-primitives";
import {
  ADMIN_REVIEW_EVENT,
  getAdminReviewListingById,
  setListingReview,
} from "@/lib/admin-review-store";
import type { AdminReviewListing } from "@/lib/admin-demo";
import {
  formatNaira,
  formatPricePeriod,
  formatPropertyType,
} from "@/lib/utils";

const statusVariant = {
  live: "palm",
  pending_review: "pending",
  rejected: "stamp",
} as const;

const statusLabel = {
  live: "Live",
  pending_review: "In review",
  rejected: "Rejected",
} as const;

export function AdminListingReview({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<AdminReviewListing | null>(null);
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/admin/listings`);
        if (response.ok) {
          const json = (await response.json()) as { data: AdminReviewListing[] };
          const row = json.data.find((item) => item.id === id) ?? null;
          if (!cancelled) {
            setListing(row);
            setReason(row?.rejectionReason ?? "");
            setReady(true);
            return;
          }
        }
      } catch {
        // fall through
      }
      if (!cancelled) {
        const row = getAdminReviewListingById(id);
        setListing(row);
        setReason(row?.rejectionReason ?? "");
        setReady(true);
      }
    }

    void load();
    const sync = () => {
      const row = getAdminReviewListingById(id);
      setListing(row);
      setReason(row?.rejectionReason ?? "");
      setReady(true);
    };
    window.addEventListener(ADMIN_REVIEW_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener(ADMIN_REVIEW_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-xl border border-line bg-white" />;
  }

  if (!listing) {
    return (
      <div className="space-y-7">
        <DashPageHeader

          title="Listing not found"
          description="This submission is not in the review queue."
        />
        <Button asChild variant="outline">
          <Link href="/dashboard/admin/listings">Back to queue</Link>
        </Button>
      </div>
    );
  }

  async function approve() {
    try {
      const response = await fetch(`/api/admin/listings/${listing!.id}/approve`, {
        method: "PATCH",
      });
      if (response.ok) {
        setMessage("Listing approved — now live for tenants.");
        setTimeout(() => router.push("/dashboard/admin/listings?filter=live"), 800);
        return;
      }
    } catch {
      // local fallback
    }
    setListingReview(listing!.id, "live");
    setMessage("Listing approved — marked live on this device.");
    setTimeout(() => router.push("/dashboard/admin/listings?filter=live"), 800);
  }

  async function reject() {
    if (!reason.trim()) {
      setMessage("Add a rejection reason so the landlord knows what to fix.");
      return;
    }
    try {
      const response = await fetch(`/api/admin/listings/${listing!.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (response.ok) {
        setMessage("Listing rejected with reason saved.");
        setTimeout(() => router.push("/dashboard/admin/listings?filter=rejected"), 800);
        return;
      }
    } catch {
      // local fallback
    }
    setListingReview(listing!.id, "rejected", reason.trim());
    setMessage("Listing rejected with reason saved.");
    setTimeout(() => router.push("/dashboard/admin/listings?filter=rejected"), 800);
  }

  async function reopen() {
    try {
      const response = await fetch(`/api/admin/listings/${listing!.id}/flag`, {
        method: "PATCH",
      });
      if (response.ok) {
        setMessage("Listing moved back to review.");
        setListing({ ...listing!, status: "pending_review", rejectionReason: undefined });
        return;
      }
    } catch {
      // local fallback
    }
    setListingReview(listing!.id, "pending_review");
    setMessage("Listing moved back to review.");
    setListing({ ...listing!, status: "pending_review", rejectionReason: undefined });
  }

  return (
    <div className="space-y-7">
      <DashPageHeader

        title={listing.title}
        description={`Submitted ${listing.submittedAt} · ${listing.landlordName}`}
        actions={
          <Badge variant={statusVariant[listing.status]}>
            {statusLabel[listing.status]}
          </Badge>
        }
      />

      {message ? (
        <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
          {message}
        </p>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <DashPanel>
            <div className="grid gap-2 p-3 sm:grid-cols-3">
              {listing.photos.map((src, index) => (
                <div
                  key={`${index}-${src.slice(0, 24)}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-line"
                >
                  {src.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={src} alt="" fill className="object-cover" sizes="240px" />
                  )}
                </div>
              ))}
            </div>
          </DashPanel>

          <DashPanel>
            <div className="space-y-3 px-4 py-5 sm:px-5">
              <p className="text-sm leading-relaxed text-navy-600">{listing.description}</p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-navy-400">Type</dt>
                  <dd className="font-medium text-ink">
                    {formatPropertyType(listing.propertyType)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-navy-400">Rent</dt>
                  <dd className="font-medium text-ink">
                    {formatNaira(listing.price)}/{formatPricePeriod(listing.pricePeriod)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-navy-400">Location</dt>
                  <dd className="font-medium text-ink">
                    {listing.area}, {listing.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-navy-400">Address</dt>
                  <dd className="font-medium text-ink">{listing.address}</dd>
                </div>
              </dl>
            </div>
          </DashPanel>
        </div>

        <div className="space-y-4">
          <DashPanel>
            <div className="space-y-3 px-4 py-5 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                Landlord
              </p>
              <p className="text-sm font-semibold text-ink">{listing.landlordName}</p>
              <p className="text-sm text-navy-600">{listing.landlordEmail}</p>
              <p className="text-sm text-navy-600">{listing.landlordPhone}</p>
            </div>
          </DashPanel>

          <DashPanel>
            <div className="space-y-3 px-4 py-5 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                Decision
              </p>
              {listing.status !== "live" ? (
                <Button type="button" variant="stamp" className="w-full" onClick={approve}>
                  Approve & go live
                </Button>
              ) : null}
              {listing.status !== "rejected" ? (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Rejection reason (required to reject)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={reject}
                  >
                    Reject listing
                  </Button>
                </>
              ) : null}
              {listing.status !== "pending_review" ? (
                <Button type="button" variant="ghost" className="w-full" onClick={reopen}>
                  Move back to review
                </Button>
              ) : null}
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/admin/listings">Back to queue</Link>
              </Button>
            </div>
          </DashPanel>

          {listing.reviewedAt ? (
            <p className="text-xs text-navy-400">
              Last decision saved on this device:{" "}
              {new Date(listing.reviewedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
