import { AdminListingReview } from "@/components/dashboard/admin-listing-review";

export default async function AdminListingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminListingReview id={id} />;
}
