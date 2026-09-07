import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { listingService } from "@/lib/services/listing.service";

export async function GET() {
  try {
    const user = await requireUser(["landlord"]);
    const listings = await listingService.listMine(user.id);
    return jsonOk(listings);
  } catch (error) {
    return jsonError(error);
  }
}
