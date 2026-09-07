import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { adminService } from "@/lib/services/admin.service";

export async function GET(request: Request) {
  try {
    await requireUser(["admin"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const listings = await adminService.listListings(status);
    return jsonOk(listings);
  } catch (error) {
    return jsonError(error);
  }
}
