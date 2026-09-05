import { EditListingForm } from "@/components/dashboard/edit-listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditListingForm id={id} />;
}
