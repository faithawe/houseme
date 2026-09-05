import Link from "next/link";
import HowItWorks from "@/components/ui/how-it-works";
import { Button } from "@/components/ui/button";
import type { Step, StepPosition } from "@/components/ui/how-it-works";

export const houseMeSteps: Step[] = [
  {
    title: "Find a room",
    description:
      "Search verified self-cons, rooms, and flats near campus or work — filter by city and budget.",
    colorTheme: "stamp",
  },
  {
    title: "List a property",
    description:
      "Landlords post photos, rent, and contact details. No agent fee on HouseMe.",
    colorTheme: "ink",
  },
  {
    title: "HouseMe reviews",
    description:
      "Every listing is checked for scams and policy issues before tenants can see it.",
    colorTheme: "palm",
  },
  {
    title: "Call the landlord",
    description:
      "Open a listing, get the phone or WhatsApp number, and arrange a visit yourself.",
    colorTheme: "stamp",
  },
];

export const houseMeStepPositions: StepPosition[] = [
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
];

type HowItWorksSectionProps = {
  /** Hide the “View all steps” link when already on /how-it-works */
  showAllStepsLink?: boolean;
};

export function HowItWorksSection({
  showAllStepsLink = true,
}: HowItWorksSectionProps) {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 pt-16 md:px-8 md:pt-20">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
            How HouseMe works
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            From search to keys — without the agent stress
          </h2>
        </div>
        {showAllStepsLink ? (
          <Button asChild variant="outline">
            <Link href="/how-it-works">View all steps</Link>
          </Button>
        ) : null}
      </div>

      <HowItWorks
        features={houseMeSteps}
        stepPositions={houseMeStepPositions}
        className="pt-8 md:pt-10"
      />
    </section>
  );
}
