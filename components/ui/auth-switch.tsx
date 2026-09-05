"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "register";

type AuthSwitchProps = {
  mode?: AuthMode;
  className?: string;
};

function withCallback(path: string, callbackUrl: string | null) {
  if (!callbackUrl) return path;
  const params = new URLSearchParams({ callbackUrl });
  return `${path}?${params.toString()}`;
}

export function AuthSwitch({ mode = "login", className }: AuthSwitchProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const tabs = [
    {
      id: "login" as const,
      label: "Log in",
      href: withCallback("/auth/login", callbackUrl),
    },
    {
      id: "register" as const,
      label: "Create account",
      href: withCallback("/auth/register", callbackUrl),
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Choose log in or create account"
      className={cn(
        "relative grid grid-cols-2 rounded-full border border-line bg-white p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = mode === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={selected}
            className={cn(
              "relative z-10 flex h-10 items-center justify-center text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2",
              selected ? "text-white" : "text-navy-600 hover:text-ink",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="auth-switch-pill"
                className="absolute inset-0 rounded-full bg-stamp"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default AuthSwitch;
export const Component = AuthSwitch;
