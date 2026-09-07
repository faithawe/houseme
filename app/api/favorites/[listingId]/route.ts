import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { favoriteService } from "@/lib/services/favorite.service";

type Params = { params: Promise<{ listingId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireUser(["tenant", "landlord", "admin"]);
    const { listingId } = await params;
    const result = await favoriteService.save(user.id, listingId);
    return jsonOk(result, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser(["tenant", "landlord", "admin"]);
    const { listingId } = await params;
    const result = await favoriteService.unsave(user.id, listingId);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
