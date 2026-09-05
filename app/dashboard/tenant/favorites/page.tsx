import Link from "next/link";
import { SavedListings } from "@/components/favorites/saved-listings";
import { Button } from "@/components/ui/button";
import { DashPageHeader } from "@/components/dashboard/dash-primitives";

export default function FavoritesPage() {
  return (
    <div className="space-y-7">
      <DashPageHeader

        title="Saved listings"
        description="Rooms you heart on listing cards stay on this device so you can compare and call landlords."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/search">Browse more</Link>
          </Button>
        }
      />
      <SavedListings />
    </div>
  );
}
