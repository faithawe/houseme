"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DashPageHeader,
  DashPanel,
} from "@/components/dashboard/dash-primitives";
import { ListingPhotoUploader } from "@/components/dashboard/listing-photo-uploader";
import { FEATURED_CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPropertyType } from "@/lib/utils";
import {
  readLandlordDrafts,
  writeLandlordDrafts,
} from "@/lib/landlord-drafts";

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

export function NewListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (photos.length === 0) {
      setMessage("Add at least one photo of the house before submitting.");
      setLoading(false);
      return;
    }

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const payload = {
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      propertyType: String(data.propertyType ?? "self_con"),
      price: Number(data.price),
      pricePeriod: String(data.pricePeriod ?? "yearly"),
      city: String(data.city ?? ""),
      area: String(data.area ?? "") || undefined,
      address: String(data.address ?? ""),
      bedrooms: Number(data.bedrooms ?? 1),
      bathrooms: Number(data.bathrooms ?? 1),
      furnished: data.furnished === "on" || data.furnished === "true",
      amenities: [],
      photos,
    };

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as {
        data?: { id: string };
        error?: { message?: string };
      };

      if (!response.ok) {
        setMessage(json.error?.message ?? "Could not submit listing. Check the form and try again.");
        return;
      }

      setMessage("Listing submitted for review. You’ll see it on My listings.");
      form.reset();
      setPhotos([]);
      setTimeout(() => router.push("/dashboard/landlord/listings"), 900);
    } catch {
      // Offline / local demo fallback
      try {
        const existing = readLandlordDrafts();
        const draft = {
          id: `draft-${Date.now()}`,
          status: "pending_review" as const,
          createdAt: new Date().toISOString(),
          title: payload.title,
          description: payload.description,
          propertyType: payload.propertyType,
          price: String(payload.price),
          pricePeriod: payload.pricePeriod,
          city: payload.city,
          area: payload.area ?? "",
          address: payload.address,
          bedrooms: String(payload.bedrooms),
          bathrooms: String(payload.bathrooms),
          photos,
        };
        writeLandlordDrafts([draft, ...existing]);
        setMessage(
          "Saved locally (API unavailable). Connect the database to sync listings across devices.",
        );
        form.reset();
        setPhotos([]);
        setTimeout(() => router.push("/dashboard/landlord/listings"), 900);
      } catch {
        setMessage(
          "Could not save this listing. If you added many photos, try fewer or smaller images.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <DashPageHeader

        title="List a property"
        description="Add photos and the basics. HouseMe reviews every listing before tenants see it."
      />

      <DashPanel>
        <form className="space-y-4 px-4 py-5 sm:px-5" onSubmit={handleSubmit}>
          {message ? (
            <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
              {message}
            </p>
          ) : null}

          <ListingPhotoUploader photos={photos} onChange={setPhotos} required />

          <div className="space-y-4 border-t border-line pt-4">
            <Field
              label="Listing title"
              htmlFor="title"
              hint="Example: Self-con near UniJos gate"
            >
              <Input
                id="title"
                name="title"
                placeholder="Write a short title tenants will search for"
                required
                minLength={10}
                maxLength={150}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              hint="Mention rent terms, what is included, and who it suits"
            >
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the house, nearby landmarks, water/power, and any house rules"
                required
                minLength={50}
                maxLength={2000}
              />
            </Field>

            <Field label="Property type" htmlFor="propertyType">
              <Select id="propertyType" name="propertyType" defaultValue="self_con">
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
                htmlFor="price"
                hint="Numbers only, no commas"
              >
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={1}
                  placeholder="e.g. 450000"
                  required
                />
              </Field>
              <Field label="Price period" htmlFor="pricePeriod">
                <Select id="pricePeriod" name="pricePeriod" defaultValue="yearly">
                  <option value="" disabled>
                    Select period
                  </option>
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>
            </div>

            <Field label="City" htmlFor="city">
              <Select id="city" name="city" defaultValue="Lagos">
                <option value="" disabled>
                  Select city
                </option>
                {FEATURED_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Area / neighbourhood"
              htmlFor="area"
              hint="The part of town tenants know"
            >
              <Input
                id="area"
                name="area"
                placeholder="e.g. Bodija, Garki, Rayfield"
              />
            </Field>

            <Field
              label="Full address"
              htmlFor="address"
              hint="Street and landmark help tenants find you"
            >
              <Input
                id="address"
                name="address"
                placeholder="e.g. 12 Ahmadu Bello Way, opposite First Bank"
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bedrooms" htmlFor="bedrooms">
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min={0}
                  placeholder="e.g. 1"
                />
              </Field>
              <Field label="Bathrooms" htmlFor="bathrooms">
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min={0}
                  placeholder="e.g. 1"
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" variant="stamp" disabled={loading}>
              {loading ? "Saving…" : "Submit for review"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/landlord/listings">Cancel</Link>
            </Button>
          </div>
        </form>
      </DashPanel>
    </div>
  );
}
