import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { listingService } from "@/lib/services/listing.service";
import { ValidationError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser(["landlord"]);
    const { id } = await params;
    const body = (await request.json()) as { photoIds?: string[] };
    if (!Array.isArray(body.photoIds) || body.photoIds.length === 0) {
      throw new ValidationError("photoIds must be a non-empty array");
    }
    const listing = await listingService.reorderPhotos(id, user.id, body.photoIds);
    return jsonOk(listing);
  } catch (error) {
    return jsonError(error);
  }
}
