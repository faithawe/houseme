import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { listingService } from "@/lib/services/listing.service";
import { ValidationError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser(["landlord"]);
    const { id } = await params;
    const body = (await request.json()) as { photos?: string[] };
    if (!Array.isArray(body.photos) || body.photos.length === 0) {
      throw new ValidationError("photos must be a non-empty array");
    }
    const listing = await listingService.addPhotos(id, user.id, body.photos);
    return jsonOk(listing, 201);
  } catch (error) {
    return jsonError(error);
  }
}
