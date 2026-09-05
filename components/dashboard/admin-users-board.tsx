"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DashPageHeader,
  DashPanel,
  DashPanelHead,
} from "@/components/dashboard/dash-primitives";
import {
  ADMIN_DEMO_USERS,
  summarizeAdminUsers,
  type AdminUserRow,
} from "@/lib/admin-demo";
import { cn } from "@/lib/utils";

type RoleFilter = "all" | "tenant" | "landlord";

const roleFilters: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "All users" },
  { id: "tenant", label: "Tenants" },
  { id: "landlord", label: "Landlords" },
];

function filterUsers(users: AdminUserRow[], filter: RoleFilter) {
  const withoutAdmin = users.filter((u) => u.role !== "admin");
  if (filter === "all") return withoutAdmin;
  return withoutAdmin.filter((u) => u.role === filter);
}

export function AdminUsersBoard() {
  const [filter, setFilter] = useState<RoleFilter>("all");
  const stats = summarizeAdminUsers(ADMIN_DEMO_USERS);

  const visible = useMemo(
    () => filterUsers(ADMIN_DEMO_USERS, filter),
    [filter],
  );

  return (
    <div className="space-y-7">
      <DashPageHeader

        title="Monitor tenants & landlords"
        description="View who is on HouseMe, how active they are, and how many listings each landlord has."
      />

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="list"
        aria-label="User summary"
      >
        {[
          { label: "Tenants", value: stats.tenants, hint: "Searching & saving" },
          { label: "Landlords", value: stats.landlords, hint: "Listing homes" },
          { label: "Flagged", value: stats.flagged, hint: "Needs follow-up" },
        ].map((item) => (
          <div
            key={item.label}
            role="listitem"
            className="min-w-0 rounded-xl border border-line bg-white px-3.5 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
              {item.label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-ink">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] text-navy-400">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {roleFilters.map((item) => (
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
          </button>
        ))}
      </div>

      <DashPanel>
        <DashPanelHead
          title="User directory"
          meta={`${visible.length} account${visible.length === 1 ? "" : "s"}`}
        />
        <div className="hidden grid-cols-[1fr_6rem_5.5rem_5rem_5rem] gap-3 border-b border-line bg-[#fafafa] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400 md:grid">
          <span>User</span>
          <span>Role</span>
          <span>Listings</span>
          <span>Joined</span>
          <span>Status</span>
        </div>
        <ul>
          {visible.map((user) => (
            <li
              key={user.id}
              className="grid gap-2 border-b border-line px-4 py-3.5 last:border-b-0 md:grid-cols-[1fr_6rem_5.5rem_5rem_5rem] md:items-center md:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-xs text-navy-600">{user.email}</p>
                <p className="text-xs text-navy-400">{user.phone}</p>
              </div>
              <p className="text-sm capitalize text-navy-600">{user.role}</p>
              <p className="text-sm tabular-nums text-navy-600">
                {user.role === "landlord" ? user.listingsCount : "—"}
              </p>
              <p className="text-sm tabular-nums text-navy-600">{user.joinedAt}</p>
              <div>
                <Badge variant={user.status === "flagged" ? "stamp" : "palm"}>
                  {user.status === "flagged" ? "Flagged" : "Active"}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </DashPanel>

      <p className="text-xs text-navy-400">
        Demo directory until the admin users API is connected. Suspend and search
        will ship with the live backend.
      </p>
    </div>
  );
}
