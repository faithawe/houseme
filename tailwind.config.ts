import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Text & UI chrome — black */
        navy: {
          DEFAULT: "#000000",
          800: "#1A1A1A",
          600: "#404040",
          400: "#737373",
        },
        photocopy: "#FFFFFF",
        slip: "#FFFFFF",
        /* CTA — gold */
        stamp: {
          DEFAULT: "#A6904A",
          700: "#8A7840",
        },
        /* Secondary accent — muted gold for badges / verified */
        palm: {
          DEFAULT: "#A6904A",
          700: "#8A7840",
          100: "#F5F0E4",
        },
        ink: "#000000",
        line: "#E5E5E5",
        mango: "#A6904A",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-figtree)", "system-ui", "sans-serif"],
      },
      /* Soft consumer-premium radii (Google / Apple product UI scale) */
      borderRadius: {
        none: "0",
        sm: "0.75rem", // 12px — controls, chips, alerts (was ~2px)
        DEFAULT: "0.875rem", // 14px
        md: "0.875rem", // 14px
        lg: "1rem", // 16px — cards / tiles
        xl: "1.25rem", // 20px — large cards / panels
        "2xl": "1.5rem", // 24px — sheets / auth shells
        "3xl": "1.75rem",
        full: "9999px", // primary CTAs / pills
      },
      boxShadow: {
        slip: "0 12px 40px -16px rgba(0, 0, 0, 0.08)",
        "slip-hover": "0 22px 48px -12px rgba(0, 0, 0, 0.12)",
        stamp: "0 0 0 1px rgba(166, 144, 74, 0.35)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
      animation: {
        marquee: "marquee var(--duration, 40s) linear infinite",
        "marquee-vertical":
          "marquee-vertical var(--duration, 40s) linear infinite",
      },
      backgroundImage: {
        perforation:
          "radial-gradient(circle, #FFFFFF 5px, transparent 5.5px)",
      },
    },
  },
  plugins: [],
};

export default config;
