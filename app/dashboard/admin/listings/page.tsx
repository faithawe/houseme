import { Suspense } from "react";
import { AdminReviewQueue } from "@/components/dashboard/admin-review-queue";

export default function AdminListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl border border-line bg-white" />
      }
    >
      <AdminReviewQueue />
    </Suspense>
  );
}
