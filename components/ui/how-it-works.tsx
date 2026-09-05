"use client";

import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { cn } from "@/lib/utils";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "stamp" | "ink" | "palm";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const themeStyles = {
  stamp: {
    bg: "bg-palm-100",
    text: "text-stamp",
    border: "border-stamp/25",
  },
  ink: {
    bg: "bg-[#f3f3f3]",
    text: "text-ink",
    border: "border-line",
  },
  palm: {
    bg: "bg-palm-100/80",
    text: "text-stamp-700",
    border: "border-palm/30",
  },
} as const;

function Card({
  number,
  title,
  description,
  colorTheme = "stamp",
  className,
  rotate,
  colors: customColors,
}: CardProps) {
  const theme = themeStyles[colorTheme];
  const bgColor = customColors?.bg || theme.bg;
  const textColor = customColors?.text || theme.text;
  const borderColor = customColors?.border || theme.border;

  return (
    <div
      className={cn(
        "relative w-full transition-transform duration-300 hover:z-30 hover:scale-[1.02] md:w-[280px]",
        rotate,
        className,
      )}
    >
      <div className="rounded-2xl border border-line bg-white p-2 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.12)]">
        <MapPin
          className={cn("mx-auto mb-5 h-7 w-7", textColor)}
          strokeWidth={1.75}
          aria-hidden
        />
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-xl border p-4",
            bgColor,
            borderColor,
          )}
        >
          <span className={cn("mb-4 font-display text-4xl font-semibold", textColor)}>
            {number}
          </span>
          <h3 className="mb-2 font-display text-xl font-semibold leading-tight text-ink">
            {title}
          </h3>
          <p className="text-sm leading-relaxed tracking-tight text-navy-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface Step {
  title: string;
  description: string;
  colorTheme?: "stamp" | "ink" | "palm";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-6" },
  {
    className: "md:absolute md:top-[120px] md:right-[15%]",
    rotate: "-rotate-6",
  },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-6" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-6",
  },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "rotate-6" },
];

export function HowItWorks({
  features,
  className,
  stepPositions,
}: HowItWorksProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultFeatures: Step[] = [
    {
      title: "Create Account",
      description:
        "Sign up in minutes. Enter your details and verify your email to get started.",
      colorTheme: "stamp",
    },
    {
      title: "Verify Identity",
      description:
        "Complete your profile verification to ensure secure transactions and compliance.",
      colorTheme: "ink",
    },
    {
      title: "Select Plan",
      description:
        "Choose from a variety of investment plans tailored to your financial goals.",
      colorTheme: "palm",
    },
    {
      title: "Analyze & Invest",
      description:
        "Review returns and make your first investment with confidence.",
      colorTheme: "stamp",
    },
    {
      title: "Track Growth",
      description:
        "Monitor your portfolio in real-time and watch your wealth grow over time.",
      colorTheme: "ink",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 1130;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 450;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 900;
  else height = 1130;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn(
          "relative max-md:pb-24 max-md:pt-10 bg-white px-4 py-16 md:py-20 md:px-8",
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div
            className="relative mx-auto flex h-auto w-full max-w-[1000px] flex-col space-y-8 md:block md:h-[var(--md-height)] md:space-y-0"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {mounted && data.length > 1 ? (
              <svg
                className="pointer-events-none absolute left-0 top-0 hidden h-full w-full md:block"
                viewBox={`0 0 1000 ${height}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                {(() => {
                  const pathD = data.reduce((acc, _, index) => {
                    if (index >= data.length - 1) return acc;
                    if (index === 0)
                      return "M 290 150 C 500 150, 550 270, 710 270";
                    if (index === 1)
                      return `${acc} C 850 270, 500 350, 290 450`;
                    if (index === 2)
                      return `${acc} C 290 600, 550 720, 750 720`;
                    if (index === 3)
                      return `${acc} C 950 720, 500 800, 290 850`;
                    return acc;
                  }, "");
                  return (
                    <m.path
                      d={pathD}
                      stroke="currentColor"
                      className="text-line"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -140 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  );
                })()}
              </svg>
            ) : null}

            {data.map((step, index) => {
              const position = positions[index % positions.length];

              return (
                <Card
                  key={`${step.title}-${index}`}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "stamp"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}

export default HowItWorks;
