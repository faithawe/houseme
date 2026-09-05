"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function RoleSelector({
  name = "role",
}: {
  name?: string;
}) {
  const [role, setRole] = useState<"tenant" | "landlord">("tenant");

  return (
    <div className="grid grid-cols-2 gap-2">
      <input type="hidden" name={name} value={role} />
      {(
        [
          { id: "tenant", label: "I'm looking", hint: "Tenant" },
          { id: "landlord", label: "I'm listing", hint: "Landlord" },
        ] as const
      ).map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setRole(option.id)}
          className={cn(
            "rounded-2xl border px-3 py-3 text-left",
            role === option.id
              ? "border-navy bg-navy text-white"
              : "border-line bg-white text-navy",
          )}
        >
          <span className="block text-sm font-semibold">{option.label}</span>
          <span className="text-xs opacity-70">{option.hint}</span>
        </button>
      ))}
    </div>
  );
}
