"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import {
  LANDLORD_DEMO_LISTINGS,
  type LandlordListingStatus,
} from "@/lib/landlord-demo";
import { getDemoListing } from "@/lib/demo-listings";
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

function seedFromDemo(id: string): FormValues | null {
  const boardRow = LANDLORD_DEMO_LISTINGS.find((listing) => listing.id === id);
  const listing = getDemoListing(id);
  if (!boardRow && !listing) return null;

  return {
    title: listing?.title ?? boardRow?.title ?? "",
    description: listing?.description ?? "",
    propertyType: listing?.propertyType ?? boardRow?.propertyType ?? "self_con",
    price: String(listing?.price ?? boardRow?.price ?? 0),
    pricePeriod: listing?.pricePeriod ?? boardRow?.pricePeriod ?? "yearly",
    city: listing?.city ?? boardRow?.city ?? "Lagos",
    area: listing?.area ?? boardRow?.area ?? "",
    address: listing?.address ?? "",
    bedrooms: String(listing?.bedrooms ?? 1),
    bathrooms: String(listing?.bathrooms ?? 1),
    photos: listing?.photos?.length
      ? listing.photos
      : boardRow?.photo
        ? [boardRow.photo]
        : [],
    status: boardRow?.status ?? "live",
    rejectionReason: boardRow?.rejectionReason,
  };
}

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
  const initialDemo = useMemo(() => seedFromDemo(id), [id]);
  const [values, setValues] = useState<FormValues | null>(initialDemo);
  const [ready, setReady] = useState(!id.startsWith("draft-"));
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    if (!id.startsWith("draft-")) {
      setReady(true);
      return;
    }
    const draftValues = seedFromDraft(id);
    setValues(draftValues);
    setReady(true);
  }, [id]);

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
    if (!values || !id.startsWith("draft-")) return;
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
    setSavedNote("Draft updated with photos on this device.");
  }

  return (
    <div className="space-y-7">
      <DashPageHeader

        title="Update your listing"
        description={
          id.startsWith("draft-")
            ? "This draft is stored on this device until the listings API is live."
            : "Update photos and details. Critical changes will go back to review once saving is connected."
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
            if (id.startsWith("draft-")) handleSaveDraft();
          }}
        >
          <ListingPhotoUploader
            photos={values.photos}
            onChange={(photos) => update("photos", photos)}
            required
          />

          <div className="space-y-4 border-t border-line pt-4">
            <Field
              label="Listing title"
              htmlFor="edit-title"
              hint="Example: Self-con near UniJos gate"
            >
              <Input
                id="edit-title"
                name="title"
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Write a short title tenants will search for"
                required
              />
            </Field>

            <Field
              label="Description"
              htmlFor="edit-description"
              hint="Mention rent terms, what is included, and who it suits"
            >
              <Textarea
                id="edit-description"
                name="description"
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                placeholder="Describe the house, nearby landmarks, water/power, and any house rules"
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
                <option value="" disabled>
                  Select property type
                </option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatPropertyType(type)}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Rent price (₦)"
                htmlFor="edit-price"
                hint="Numbers only, no commas"
              >
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min={1}
                  value={values.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="e.g. 450000"
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
                  <option value="" disabled>
                    Select period
                  </option>
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
                <option value="" disabled>
                  Select city
                </option>
                {FEATURED_CITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Area / neighbourhood"
              htmlFor="edit-area"
              hint="The part of town tenants know"
            >
              <Input
                id="edit-area"
                name="area"
                value={values.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder="e.g. Bodija, Garki, Rayfield"
              />
            </Field>

            <Field
              label="Full address"
              htmlFor="edit-address"
              hint="Street and landmark help tenants find you"
            >
              <Input
                id="edit-address"
                name="address"
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="e.g. 12 Ahmadu Bello Way, opposite First Bank"
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
                  placeholder="e.g. 1"
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
                  placeholder="e.g. 1"
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {id.startsWith("draft-") ? (
              <Button type="submit" variant="stamp">
                Save draft
              </Button>
            ) : (
              <Button type="button" variant="stamp" disabled>
                Save changes
              </Button>
            )}
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
