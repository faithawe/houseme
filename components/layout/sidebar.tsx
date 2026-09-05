"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Heart,
  LayoutGrid,
  Plus,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const navByRole: Record<string, { title: string; sections: NavSection[] }> = {
  landlord: {
    title: "Landlord",
    sections: [
      {
        items: [
          { href: "/dashboard/landlord", label: "Overview", icon: LayoutGrid },
          {
            href: "/dashboard/landlord/listings",
            label: "Listings",
            icon: Building2,
          },
          {
            href: "/dashboard/landlord/listings/new",
            label: "Add listing",
            icon: Plus,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            href: "/dashboard/landlord/profile",
            label: "Profile",
            icon: UserRound,
          },
        ],
      },
    ],
  },
  tenant: {
    title: "Tenant",
    sections: [
      {
        items: [
          { href: "/dashboard/tenant", label: "Overview", icon: LayoutGrid },
          { href: "/dashboard/tenant/favorites", label: "Saved", icon: Heart },
        ],
      },
      {
        label: "Account",
        items: [
          {
            href: "/dashboard/tenant/profile",
            label: "Profile",
            icon: UserRound,
          },
        ],
      },
    ],
  },
  admin: {
    title: "Admin",
    sections: [
      {
        items: [
          { href: "/dashboard/admin", label: "Overview", icon: LayoutGrid },
          {
            href: "/dashboard/admin/listings",
            label: "Review queue",
            icon: Shield,
          },
          { href: "/dashboard/admin/users", label: "Users", icon: Users },
        ],
      },
      {
        label: "Account",
        items: [
          {
            href: "/dashboard/admin/profile",
            label: "Profile",
            icon: UserRound,
          },
        ],
      },
    ],
  },
};

function allItems(role: string): NavItem[] {
  return navByRole[role].sections.flatMap((section) => section.items);
}

function roleFromPath(pathname: string) {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/tenant")) return "tenant";
  return "landlord";
}

function isActive(pathname: string, href: string, role: string) {
  if (pathname === href) return true;

  const overview = `/dashboard/${role}`;
  if (href === overview) return false;

  const siblings = allItems(role)
    .map((item) => item.href)
    .filter((itemHref) => itemHref !== overview && itemHref.startsWith(href));
  const moreSpecific = siblings.some(
    (itemHref) =>
      itemHref !== href &&
      (pathname === itemHref || pathname.startsWith(`${itemHref}/`)),
  );
  if (moreSpecific) return false;

  return pathname.startsWith(`${href}/`) || pathname.startsWith(href);
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-3 rounded-xl px-3 text-[13px] leading-none tracking-[-0.01em] transition-colors",
        active
          ? "bg-stamp font-medium text-white"
          : "font-normal text-navy-600 hover:bg-black/[0.04] hover:text-ink",
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          active ? "text-white" : "text-navy-400",
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const role = roleFromPath(pathname);
  const nav = navByRole[role];
  const flat = allItems(role);

  return (
    <aside className="w-full border-b border-[#e8eaed] bg-white md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-[240px] md:shrink-0 md:border-b-0 md:border-r md:self-start">
      {/* Mobile: compact horizontal tabs */}
      <nav
        aria-label={`${nav.title} navigation`}
        className="flex gap-0.5 overflow-x-auto px-3 py-2 md:hidden"
      >
        {flat.map((item) => {
          const active = isActive(pathname, item.href, role);
          return <NavLink key={item.href} item={item} active={active} />;
        })}
      </nav>

      {/* Desktop: product sidebar */}
      <div className="hidden h-full flex-col px-3 py-5 md:flex">
        <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#80868b]">
          {nav.title}
        </p>

        <nav aria-label={`${nav.title} navigation`} className="flex flex-col gap-4">
          {nav.sections.map((section, index) => (
            <div key={section.label ?? `section-${index}`} className="flex flex-col gap-0.5">
              {section.label ? (
                <p className="mb-1 px-3 text-[11px] font-medium text-[#80868b]">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href, role)}
                />
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
