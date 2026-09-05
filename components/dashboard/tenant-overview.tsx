"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { useFavoriteIds } from "@/components/favorites/favorite-button";
import { Button } from "@/components/ui/button";
import {
  DashPageHeader,
  DashPanel,
  DashPanelHead,
} from "@/components/dashboard/dash-primitives";
import { getDemoListing, getFeaturedListings } from "@/lib/demo-listings";
import {
  formatNaira,
  formatPricePeriod,
  formatPropertyType,
} from "@/lib/utils";

const cities = ["Lagos", "Abuja", "Jos", "Ibadan", "Enugu", "Port Harcourt"];

export function TenantOverview({
  firstName,
  needLandlord = false,
}: {
  firstName: string;
  needLandlord?: boolean;
}) {
  const savedIds = useFavoriteIds();
  const saved = savedIds
    .map((id) => getDemoListing(id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing))
    .slice(0, 4);
  const suggested = getFeaturedListings(4);

  return (
    <div className="space-y-7">
      {needLandlord ? (
        <div
          role="status"
          className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink shadow-[0_1px_0_rgba(0,0,0,0.03)]"
        >
          <p className="font-semibold">Landlord desk needs a landlord account</p>
          <p className="mt-1 text-navy-600">
            You&apos;re on a tenant session. Sign out, then use{" "}
            <span className="font-medium text-ink">landlord@houseme.ng</span> /{" "}
            <span className="font-medium text-ink">Landlord1!House</span>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="stamp"
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/auth/login?callbackUrl=%2Fdashboard%2Flandlord",
                })
              }
            >
              Switch to landlord login
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/tenant">Stay here</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <DashPageHeader

        title={<>{firstName}, pick up where you left off</>}
        description="Search verified rooms, heart the ones worth calling about, then message the landlord direct."
        actions={
          <Button asChild variant="stamp" className="gap-1.5">
            <Link href="/search">
              <Search className="h-4 w-4" aria-hidden />
              Search listings
            </Link>
          </Button>
        }
      />

      <div className="dash-enter-delay-1 overflow-hidden rounded-xl border border-line bg-white text-ink">
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stamp">
              Quick search
            </p>
            <p className="mt-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Where are you relocating?
            </p>
            <p className="mt-1 max-w-md text-sm text-navy-600">
              Jump a city, or open full search with filters for rent and type.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/search">
              Open filters
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3 sm:px-5">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/search?city=${encodeURIComponent(city)}`}
              className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink transition hover:border-stamp hover:bg-palm-100 hover:text-stamp-700"
            >
              {city}
            </Link>
          ))}
        </div>
      </div>

      <div className="dash-enter-delay-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <DashPanel>
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
                Saved on this device
              </p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums tracking-tight text-ink">
                {savedIds.length}
              </p>
              <p className="mt-1 text-xs text-navy-600">
                {savedIds.length
                  ? "Open a listing for the landlord number."
                  : "Heart listings while you browse."}
              </p>
            </div>
            <Heart
              className="h-8 w-8 text-stamp/80"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </DashPanel>
        <DashPanel className="sm:min-w-[12rem]">
          <div className="flex h-full flex-col justify-between px-4 py-4 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
              Next step
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {savedIds.length ? "Call a landlord" : "Start a city search"}
            </p>
            <Button
              asChild
              size="sm"
              variant={savedIds.length ? "stamp" : "outline"}
              className="mt-3 w-fit"
            >
              <Link href={savedIds.length ? "/dashboard/tenant/favorites" : "/search"}>
                {savedIds.length ? "Open saved" : "Browse"}
              </Link>
            </Button>
          </div>
        </DashPanel>
      </div>

      <DashPanel className="dash-enter-delay-3">
        <DashPanelHead
          title="Saved rooms"
          meta={
            savedIds.length
              ? `${savedIds.length} pinned`
              : "Nothing pinned yet"
          }
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/tenant/favorites">All saved</Link>
            </Button>
          }
        />

        {saved.length === 0 ? (
          <div className="px-4 py-10 text-center sm:px-5">
            <p className="font-display text-lg font-semibold text-ink">
              Your shortlist is empty
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-navy-600">
              Browse the board and heart rooms you want to call about later.
            </p>
            <Button asChild variant="stamp" className="mt-5">
              <Link href="/search">Browse listings</Link>
            </Button>
          </div>
        ) : (
          <ul>
            {saved.map((listing) => (
              <li
                key={listing.id}
                className="grid gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center sm:px-5"
              >
                <div className="relative h-16 w-full overflow-hidden rounded-xl bg-line sm:h-14 sm:w-[4.5rem]">
                  <Image
                    src={listing.photos[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
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
                <Button asChild size="sm" variant="stamp">
                  <Link href={`/listings/${listing.id}`}>View</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DashPanel>

      <section aria-labelledby="suggested-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="suggested-heading"
              className="text-sm font-semibold text-ink"
            >
              From the board
            </h2>
            <p className="mt-0.5 text-xs text-navy-400">
              Sample verified rooms you can open now.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/search">View all</Link>
          </Button>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {suggested.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/listings/${listing.id}`}
                className="group flex gap-3 overflow-hidden rounded-xl border border-line bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:border-stamp"
              >
                <div className="relative h-[4.75rem] w-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-line">
                  <Image
                    src={listing.photos[0]}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    sizes="84px"
                  />
                </div>
                <div className="min-w-0 py-0.5">
                  <p className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-stamp">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-xs text-navy-400">
                    {listing.area}, {listing.city}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {formatNaira(listing.price)}/
                    {formatPricePeriod(listing.pricePeriod)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
