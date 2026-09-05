import Link from "next/link";
import { Button } from "@/components/ui/button";

type Action = { href: string; label: string; variant?: "default" | "outline" | "navy" };

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  actions = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: Action[];
}) {
  return (
    <div className="mx-auto max-w-xl py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy">
        {title}
      </h1>
      <p className="mt-3 text-navy/70">{description}</p>
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action.href} asChild variant={action.variant ?? "default"}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
