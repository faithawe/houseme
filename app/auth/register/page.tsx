import { Suspense } from "react";
import type { Metadata } from "next";
import { TravelConnectSignIn } from "@/components/ui/travel-connect-signin-1";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[36rem] animate-pulse rounded-xl border border-line bg-white" />
      }
    >
      <TravelConnectSignIn mode="register" />
    </Suspense>
  );
}
