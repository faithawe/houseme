import { jsonError, jsonList, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { listingService } from "@/lib/services/listing.service";
import { searchService } from "@/lib/services/search.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await searchService.search(Object.fromEntries(searchParams));
    return jsonList(result.data, result.pagination);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(["landlord"]);
    const body = await request.json();
    const listing = await listingService.create(user.id, body);
    return jsonOk(listing, 201);
  } catch (error) {
    return jsonError(error);
  }
}
