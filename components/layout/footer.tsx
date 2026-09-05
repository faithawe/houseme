import Link from "next/link";
import { HouseMeLogo } from "@/components/brand/houseme-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">Stay updated</p>
            <p className="mt-1 text-sm text-white/65">
              New verified rooms in your city — email alerts come later.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              name="email"
              placeholder="Email address"
              className="border-white/20 bg-white text-ink placeholder:text-navy-400"
              aria-label="Email address"
              disabled
            />
            <Button type="button" variant="stamp" className="shrink-0" disabled>
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <HouseMeLogo variant="light" size="md" className="mb-3" />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">
            Verified rooms and flats for students, NYSC corps members, and interns
            relocating across Nigeria.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stamp">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-white/70">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-white">
                Listings
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-white">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stamp">
            For landlords
          </p>
          <ul className="mt-3 space-y-2 text-white/70">
            <li>
              <Link
                href="/dashboard/landlord/listings/new"
                className="hover:text-white"
              >
                List a property
              </Link>
            </li>
            <li>
              <Link href="/dashboard/landlord" className="hover:text-white">
                Landlord board
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="hover:text-white">
                Create account
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stamp">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-white/70">
            <li>
              <a href="mailto:hello@houseme.ng" className="hover:text-white">
                hello@houseme.ng
              </a>
            </li>
            <li>Nigeria — nationwide board</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/45">
        Every listing is reviewed before it goes live. No agent fees on the platform.
      </div>
    </footer>
  );
}
