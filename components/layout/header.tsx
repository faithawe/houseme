"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { HouseMeLogo } from "@/components/brand/houseme-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Listings" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function dashboardHref(role?: string) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "landlord":
      return "/dashboard/landlord";
    default:
      return "/dashboard/tenant";
  }
}

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(!isHome);
  const overlayNav = isHome && !pastHero && !open;
  const user = session?.user;

  useEffect(() => {
    setOpen(false);
    if (!isHome) {
      setPastHero(true);
      return;
    }

    const hero = document.getElementById("site-hero");
    if (!hero) {
      setPastHero(true);
      return;
    }

    setPastHero(false);

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome, pathname]);

  const scrolled = pastHero || open;

  const navLinkClass = (href: string) =>
    cn(
      "relative rounded-xl py-1 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2",
      overlayNav
        ? "text-white/80 hover:text-white focus-visible:ring-offset-transparent"
        : "text-ink/70 hover:text-ink focus-visible:ring-offset-white",
      isActivePath(pathname, href) &&
        (overlayNav
          ? "text-white after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-stamp"
          : "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-stamp"),
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow,color] duration-300 ease-out",
          overlayNav ? "text-white" : "text-ink",
          scrolled
            ? "border-b border-line bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="site-shell relative flex h-16 items-center justify-between">
          <Link
            href="/"
            className={cn(
              "group z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2",
              overlayNav
                ? "focus-visible:ring-offset-transparent"
                : "focus-visible:ring-offset-white",
            )}
          >
            <HouseMeLogo
              variant={overlayNav ? "light" : "default"}
              size="md"
              compact
            />
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="z-10 hidden items-center gap-2 md:flex">
            {status === "authenticated" && user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    overlayNav
                      ? "text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-offset-transparent"
                      : "focus-visible:ring-offset-white",
                  )}
                >
                  <Link href={dashboardHref(user.role)}>Dashboard</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    overlayNav
                      ? "border-white/40 bg-transparent text-white hover:bg-white hover:text-ink focus-visible:ring-offset-transparent"
                      : "focus-visible:ring-offset-white",
                  )}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    overlayNav
                      ? "text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-offset-transparent"
                      : "focus-visible:ring-offset-white",
                  )}
                >
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  variant="stamp"
                  className={cn(
                    overlayNav && "focus-visible:ring-offset-transparent",
                    !overlayNav && "focus-visible:ring-offset-white",
                  )}
                >
                  <Link href="/auth/login?callbackUrl=%2Fdashboard%2Flandlord">
                    List your property
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className={cn(
              "z-10 rounded-xl p-2 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2",
              overlayNav
                ? "focus-visible:ring-offset-transparent"
                : "focus-visible:ring-offset-white",
            )}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={cn(
            "border-t border-line bg-white lg:hidden",
            open ? "block" : "hidden",
          )}
        >
          <nav className="site-shell flex flex-col gap-1 py-3 text-sm text-ink" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-2 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  isActivePath(pathname, link.href)
                    ? "bg-palm-100 font-medium text-ink"
                    : "text-ink/75 hover:bg-black/5 hover:text-ink",
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {status === "authenticated" && user ? (
              <>
                <Link
                  href={dashboardHref(user.role)}
                  className="rounded-xl px-2 py-2.5 text-ink hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="rounded-xl px-2 py-2.5 text-left font-semibold text-stamp hover:bg-palm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  onClick={() => {
                    setOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-xl px-2 py-2.5 text-ink hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/login?callbackUrl=%2Fdashboard%2Flandlord"
                  className="rounded-xl px-2 py-2.5 font-semibold text-stamp hover:bg-palm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  onClick={() => setOpen(false)}
                >
                  List your property
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {!isHome ? <div className="h-16" aria-hidden="true" /> : null}
    </>
  );
}
