import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { favoriteService } from "@/lib/services/favorite.service";

export async function GET() {
  try {
    const user = await requireUser(["tenant", "landlord", "admin"]);
    const favorites = await favoriteService.list(user.id);
    return jsonOk(favorites);
  } catch (error) {
    return jsonError(error);
  }
}
