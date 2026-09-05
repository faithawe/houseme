import { Suspense } from "react";
import type { Metadata } from "next";
import { TravelConnectSignIn } from "@/components/ui/travel-connect-signin-1";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[32rem] animate-pulse rounded-xl border border-line bg-white" />
      }
    >
      <TravelConnectSignIn mode="login" />
    </Suspense>
  );
}
