import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { listingService } from "@/lib/services/listing.service";

type Params = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser(["landlord"]);
    const { id, photoId } = await params;
    const listing = await listingService.deletePhoto(id, user.id, photoId);
    return jsonOk(listing);
  } catch (error) {
    return jsonError(error);
  }
}
