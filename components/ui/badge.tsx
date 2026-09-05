import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "palm" | "stamp" | "navy" | "pending";

const variants: Record<BadgeVariant, string> = {
  default: "bg-photocopy text-navy",
  palm: "bg-palm-100 text-palm-700",
  stamp: "bg-stamp/10 text-stamp",
  navy: "bg-navy text-white",
  pending: "bg-mango/15 text-navy",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
