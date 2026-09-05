import { useId } from "react";
import { cn } from "@/lib/utils";

export type HouseMeLogoProps = {
  /** Use on dark backgrounds (hero overlay, footer). */
  variant?: "default" | "light";
  /** Hide “Verified housing” tagline (header nav). */
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { word: "text-[15px]", tag: "text-[8px] mt-1" },
  md: { word: "text-lg", tag: "text-[9px] mt-1" },
  lg: { word: "text-[2rem] leading-none", tag: "text-[10px] mt-1.5" },
} as const;

/** Custom “o” — uses invisible “o” for Syne metrics; roof overlaps circle top. */
function LetterHouseO({
  variant,
  className,
}: {
  variant: "default" | "light";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const roofId = `houseme-o-roof-${uid}`;
  const ink = variant === "light" ? "#FFFFFF" : "#0A0A0A";
  const door = variant === "light" ? "rgba(255,255,255,0.55)" : "#737373";
  const roofEdge =
    variant === "light" ? "rgba(255,255,255,0.22)" : "rgba(10,10,10,0.12)";

  return (
    <span
      className={cn("relative inline-block leading-none", className)}
      aria-hidden
    >
      {/* Matches Syne spacing & baseline exactly */}
      <span className="invisible select-none">o</span>

      <svg
        viewBox="0 0 24 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute left-1/2 top-[52%] w-[1.55em] max-w-none -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <defs>
          <linearGradient
            id={roofId}
            x1="12"
            y1="1"
            x2="12"
            y2="11.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C4AE62" />
            <stop offset="0.45" stopColor="#A6904A" />
            <stop offset="1" stopColor="#85733A" />
          </linearGradient>
        </defs>

        {/* Letter body — drawn first so roof can cap the top */}
        <circle
          cx="12"
          cy="17.25"
          r="6.1"
          stroke={ink}
          strokeWidth="1.85"
        />

        {/* Doorway */}
        <path
          d="M12 21.85V17.1"
          stroke={door}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Gold roof — wide eaves, sits on circle top (y ≈ 11.15) */}
        <path
          d="M1.75 11.35 12 1.25 22.25 11.35Z"
          fill={`url(#${roofId})`}
          stroke={roofEdge}
          strokeWidth="0.65"
          strokeLinejoin="round"
        />

        {/* Eave — anchors roof to the letter */}
        <path
          d="M2.5 11.35h19"
          stroke={ink}
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity={variant === "light" ? 0.32 : 0.2}
        />
      </svg>
    </span>
  );
}

function TypographicWordmark({
  variant,
  size,
}: {
  variant: "default" | "light";
  size: keyof typeof sizeMap;
}) {
  const tokens = sizeMap[size];
  const ink = variant === "light" ? "text-white" : "text-ink";

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-semibold leading-none tracking-[-0.055em]",
        tokens.word,
      )}
      aria-hidden
    >
      <span className={ink}>H</span>
      <LetterHouseO variant={variant} />
      <span className={ink}>use</span>
      <span className="text-stamp">Me</span>
    </span>
  );
}

export function HouseMeLogo({
  variant = "default",
  compact = false,
  size = "md",
  className,
}: HouseMeLogoProps) {
  const tokens = sizeMap[size];

  return (
    <span
      className={cn("inline-flex flex-col leading-none", className)}
      aria-label="HouseMe"
    >
      <TypographicWordmark variant={variant} size={size} />
      {!compact ? (
        <span
          className={cn(
            "font-sans font-medium uppercase tracking-[0.22em]",
            tokens.tag,
            variant === "light" ? "text-white/50" : "text-navy-400",
            size === "sm" && "hidden sm:inline",
          )}
        >
          Verified housing
        </span>
      ) : null}
    </span>
  );
}

/** Icon-only stylized “o” for favicons and compact slots. */
export function HouseMeMarkOnly({
  variant = "default",
  size = 36,
  className,
}: {
  variant?: "default" | "light";
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const roofId = `houseme-mark-roof-${uid}`;
  const ink = variant === "light" ? "#FFFFFF" : "#0A0A0A";
  const door = variant === "light" ? "rgba(255,255,255,0.55)" : "#737373";
  const roofEdge =
    variant === "light" ? "rgba(255,255,255,0.22)" : "rgba(10,10,10,0.12)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient
          id={roofId}
          x1="24"
          y1="4"
          x2="24"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C4AE62" />
          <stop offset="0.45" stopColor="#A6904A" />
          <stop offset="1" stopColor="#85733A" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="29" r="11" stroke={ink} strokeWidth="3" />
      <path
        d="M24 37.5V30"
        stroke={door}
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M5 19.5 24 4 43 19.5Z"
        fill={`url(#${roofId})`}
        stroke={roofEdge}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M7 19.5h34"
        stroke={ink}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={variant === "light" ? 0.32 : 0.2}
      />
    </svg>
  );
}
