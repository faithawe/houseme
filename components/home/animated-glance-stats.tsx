"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlanceStat = {
  value: string;
  label: string;
};

export const HOUSEME_GLANCE_STATS: GlanceStat[] = [
  { value: "8+", label: "Cities covered" },
  { value: "100%", label: "Listings reviewed" },
  { value: "0%", label: "Agent fees on HouseMe" },
  { value: "Direct", label: "Phone & WhatsApp" },
];

function parseNumericStat(value: string): {
  target: number | null;
  prefix: string;
  suffix: string;
} {
  const match = value.match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) {
    return { target: null, prefix: "", suffix: "" };
  }
  return {
    prefix: match[1] ?? "",
    target: Number(match[2]),
    suffix: match[3] ?? "",
  };
}

function CountUpValue({
  value,
  active,
  durationMs = 1100,
}: {
  value: string;
  active: boolean;
  durationMs?: number;
}) {
  const { target, prefix, suffix } = parseNumericStat(value);
  const [display, setDisplay] = useState(target === null ? value : `${prefix}0${suffix}`);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (target === null) {
      setDisplay(value);
      return;
    }

    if (reduceMotion) {
      setDisplay(active ? value : `${prefix}0${suffix}`);
      return;
    }

    if (!active) {
      setDisplay(`${prefix}0${suffix}`);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplay(`${prefix}${current}${suffix}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs, prefix, reduceMotion, suffix, target, value]);

  return <>{display}</>;
}

export function AnimatedGlanceStats({
  stats = HOUSEME_GLANCE_STATS,
  className,
  variant = "overlay",
}: {
  stats?: GlanceStat[];
  className?: string;
  /** overlay = absolute strip over photos; panel = standalone section strip */
  variant?: "overlay" | "panel";
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Lower threshold so the compact overlay strip retriggers reliably
  const isInView = useInView(ref, { amount: 0.2, margin: "0px 0px -8% 0px", once: false });
  const reduceMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      aria-label="HouseMe at a glance"
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-slip sm:grid-cols-4",
        variant === "overlay" && "absolute inset-x-0 bottom-0 z-10",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-white px-3 py-3.5 sm:px-3 sm:py-4"
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0.35, y: 10 }
          }
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            delay: isInView && !reduceMotion ? index * 0.09 : 0,
          }}
        >
          <p className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            <CountUpValue value={stat.value} active={isInView} durationMs={1050} />
          </p>
          <p className="mt-1 text-[11px] leading-snug text-navy-600 sm:text-xs">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
