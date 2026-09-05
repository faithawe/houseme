import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyPage() {
  return (
    <PlaceholderPage
      eyebrow="Email"
      title="Verify your email"
      description="When Auth is built, this page will read the token from the link and activate the account."
      actions={[{ href: "/auth/login", label: "Go to login", variant: "navy" }]}
    />
  );
}
