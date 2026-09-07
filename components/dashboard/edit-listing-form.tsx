"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DashPageHeader,
  DashPanel,
} from "@/components/dashboard/dash-primitives";
import { ListingPhotoUploader } from "@/components/dashboard/listing-photo-uploader";
import type { LandlordListingStatus } from "@/lib/landlord-demo";
import {
  readLandlordDrafts,
  writeLandlordDrafts,
  type LandlordDraftListing,
} from "@/lib/landlord-drafts";
import { FEATURED_CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPropertyType } from "@/lib/utils";

const statusLabel: Record<LandlordListingStatus, string> = {
  live: "Live",
  pending_review: "In review",
  rejected: "Needs fix",
  draft: "Draft",
};

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wider text-navy-400"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-navy-400">{hint}</p> : null}
    </div>
  );
}

type FormValues = {
  title: string;
  description: string;
  propertyType: string;
  price: string;
  pricePeriod: string;
  city: string;
  area: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  photos: string[];
  status: LandlordListingStatus;
  rejectionReason?: string;
};

function seedFromDraft(id: string): FormValues | null {
  const draft = readLandlordDrafts().find((item) => item.id === id);
  if (!draft) return null;
  return {
    title: draft.title ?? "",
    description: draft.description ?? "",
    propertyType: draft.propertyType ?? "self_con",
    price: String(draft.price ?? ""),
    pricePeriod: draft.pricePeriod ?? "yearly",
    city: draft.city ?? "Lagos",
    area: draft.area ?? "",
    address: draft.address ?? "",
    bedrooms: String(draft.bedrooms ?? 1),
    bathrooms: String(draft.bathrooms ?? 1),
    photos: Array.isArray(draft.photos) ? draft.photos : [],
    status: "pending_review",
  };
}

export function EditListingForm({ id }: { id: string }) {
  const isDraft = id.startsWith("draft-");
  const [values, setValues] = useState<FormValues | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isDraft) {
        if (!cancelled) {
          setValues(seedFromDraft(id));
          setReady(true);
        }
        return;
      }

      try {
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) throw new Error("not found");
        const json = (await response.json()) as {
          data: {
            title: string;
            description: string;
            propertyType: string;
            price: number;
            pricePeriod: string;
            city: string;
            area: string | null;
            address: string;
            bedrooms: number;
            bathrooms: number;
            photos: { url: string }[];
            status: LandlordListingStatus;
            rejectionReason: string | null;
          };
        };
        if (cancelled) return;
        const listing = json.data;
        setValues({
          title: listing.title,
          description: listing.description,
          propertyType: listing.propertyType,
          price: String(listing.price),
          pricePeriod: listing.pricePeriod,
          city: listing.city,
          area: listing.area ?? "",
          address: listing.address,
          bedrooms: String(listing.bedrooms),
          bathrooms: String(listing.bathrooms),
          photos: listing.photos.map((p) => p.url),
          status:
            listing.status === "live" ||
            listing.status === "pending_review" ||
            listing.status === "rejected"
              ? listing.status
              : "draft",
          rejectionReason: listing.rejectionReason ?? undefined,
        });
      } catch {
        if (!cancelled) setValues(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, isDraft]);

  if (ready && !values) {
    return (
      <div className="space-y-7">
        <DashPageHeader
          title="Listing not found"
          description="This listing is not on your board, or the local draft was cleared."
        />
        <Button asChild variant="outline">
          <Link href="/dashboard/landlord/listings">Back to listings</Link>
        </Button>
      </div>
    );
  }

  if (!values) {
    return (
      <div className="h-64 animate-pulse rounded-xl border border-line bg-white" />
    );
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleSaveDraft() {
    if (!values || !isDraft) return;
    if (values.photos.length === 0) {
      setSavedNote("Add at least one photo before saving.");
      return;
    }
    const drafts = readLandlordDrafts();
    const next: LandlordDraftListing = {
      id,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      title: values.title,
      description: values.description,
      propertyType: values.propertyType,
      price: values.price,
      pricePeriod: values.pricePeriod,
      city: values.city,
      area: values.area,
      address: values.address,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      photos: values.photos,
    };
    writeLandlordDrafts([next, ...drafts.filter((item) => item.id !== id)]);
    setSavedNote("Draft updated on this device.");
  }

  async function handleSaveRemote() {
    if (!values || isDraft) return;
    if (values.photos.length === 0) {
      setSavedNote("Add at least one photo before saving.");
      return;
    }
    setSaving(true);
    setSavedNote(null);
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          propertyType: values.propertyType,
          price: Number(values.price),
          pricePeriod: values.pricePeriod,
          city: values.city,
          area: values.area || undefined,
          address: values.address,
          bedrooms: Number(values.bedrooms),
          bathrooms: Number(values.bathrooms),
          photos: values.photos,
        }),
      });
      const json = (await response.json()) as {
        data?: { status: LandlordListingStatus; rejectionReason: string | null };
        error?: { message?: string };
      };
      if (!response.ok) {
        setSavedNote(json.error?.message ?? "Could not save listing.");
        return;
      }
      if (json.data) {
        setValues((current) =>
          current
            ? {
                ...current,
                status:
                  json.data!.status === "live" ||
                  json.data!.status === "pending_review" ||
                  json.data!.status === "rejected"
                    ? json.data!.status
                    : current.status,
                rejectionReason: json.data!.rejectionReason ?? undefined,
              }
            : current,
        );
      }
      setSavedNote(
        "Listing saved. Critical changes may send it back to review.",
      );
    } catch {
      setSavedNote("Could not save listing. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <DashPageHeader
        title="Update your listing"
        description={
          isDraft
            ? "Local draft — submit a new listing from New listing to sync to the server."
            : "Update photos and details. Critical changes re-enter review."
        }
        actions={
          <Badge
            variant={
              values.status === "live"
                ? "palm"
                : values.status === "pending_review"
                  ? "pending"
                  : values.status === "rejected"
                    ? "stamp"
                    : "default"
            }
          >
            {statusLabel[values.status]}
          </Badge>
        }
      />

      {values.rejectionReason ? (
        <p className="rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm text-ink">
          {values.rejectionReason}
        </p>
      ) : null}
      {savedNote ? (
        <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
          {savedNote}
        </p>
      ) : null}

      <DashPanel>
        <form
          className="space-y-4 px-4 py-5 sm:px-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (isDraft) handleSaveDraft();
            else void handleSaveRemote();
          }}
        >
          <ListingPhotoUploader
            photos={values.photos}
            onChange={(photos) => update("photos", photos)}
            required
          />

          <div className="space-y-4 border-t border-line pt-4">
            <Field label="Listing title" htmlFor="edit-title">
              <Input
                id="edit-title"
                name="title"
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </Field>

            <Field label="Description" htmlFor="edit-description">
              <Textarea
                id="edit-description"
                name="description"
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                required
              />
            </Field>

            <Field label="Property type" htmlFor="edit-propertyType">
              <Select
                id="edit-propertyType"
                name="propertyType"
                value={values.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatPropertyType(type)}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rent price (₦)" htmlFor="edit-price">
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min={1}
                  value={values.price}
                  onChange={(e) => update("price", e.target.value)}
                  required
                />
              </Field>
              <Field label="Price period" htmlFor="edit-pricePeriod">
                <Select
                  id="edit-pricePeriod"
                  name="pricePeriod"
                  value={values.pricePeriod}
                  onChange={(e) => update("pricePeriod", e.target.value)}
                >
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>
            </div>

            <Field label="City" htmlFor="edit-city">
              <Select
                id="edit-city"
                name="city"
                value={values.city}
                onChange={(e) => update("city", e.target.value)}
              >
                {FEATURED_CITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Area / neighbourhood" htmlFor="edit-area">
              <Input
                id="edit-area"
                name="area"
                value={values.area}
                onChange={(e) => update("area", e.target.value)}
              />
            </Field>

            <Field label="Address" htmlFor="edit-address">
              <Input
                id="edit-address"
                name="address"
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bedrooms" htmlFor="edit-bedrooms">
                <Input
                  id="edit-bedrooms"
                  name="bedrooms"
                  type="number"
                  min={0}
                  value={values.bedrooms}
                  onChange={(e) => update("bedrooms", e.target.value)}
                />
              </Field>
              <Field label="Bathrooms" htmlFor="edit-bathrooms">
                <Input
                  id="edit-bathrooms"
                  name="bathrooms"
                  type="number"
                  min={0}
                  value={values.bathrooms}
                  onChange={(e) => update("bathrooms", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" variant="stamp" disabled={saving}>
              {saving ? "Saving…" : isDraft ? "Save draft" : "Save changes"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/landlord/listings">Back to listings</Link>
            </Button>
            {values.status === "live" ? (
              <Button asChild variant="ghost">
                <Link href={`/listings/${id}`}>View public page</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </DashPanel>
    </div>
  );
}
