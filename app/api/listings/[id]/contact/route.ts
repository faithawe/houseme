import { jsonError, jsonOk } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { listingService } from "@/lib/services/listing.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    const userAgent = request.headers.get("user-agent");
    const result = await listingService.recordContact(
      id,
      session?.user?.id,
      userAgent,
    );
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
