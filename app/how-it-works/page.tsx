import type { Metadata } from "next";
import { HowItWorksSection } from "@/components/home/how-it-works-section";

export const metadata: Metadata = {
  title: "How it works",
};

export default function HowItWorksPage() {
  return (
    <div>
      <HowItWorksSection showAllStepsLink={false} />
    </div>
  );
}
