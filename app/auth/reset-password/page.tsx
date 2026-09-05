import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto h-64 max-w-md animate-pulse rounded-xl border border-line bg-white" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
