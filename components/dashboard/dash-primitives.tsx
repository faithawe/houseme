import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashPageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function DashPanel({
  children,
  className,
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)]",
        !flush && "p-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashPanelHead({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {meta ? <div className="mt-0.5 text-xs text-navy-400">{meta}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusDot({
  tone,
}: {
  tone: "live" | "pending" | "rejected" | "draft" | "neutral";
}) {
  const colors = {
    live: "bg-ink",
    pending: "bg-stamp",
    rejected: "bg-stamp-700",
    draft: "bg-navy-400",
    neutral: "bg-navy-400",
  } as const;

  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", colors[tone])}
      aria-hidden
    />
  );
}
