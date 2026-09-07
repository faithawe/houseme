import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { listingService } from "@/lib/services/listing.service";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    const isStaff =
      session?.user?.role === "admin" || session?.user?.role === "landlord";

    const listing = await listingService.getById(id, {
      includeNonLive: Boolean(isStaff),
      bumpView: true,
    });

    if (!listing) throw new NotFoundError("Listing not found");

    if (
      listing.status !== "live" &&
      session?.user?.role === "landlord" &&
      listing.landlordId !== session.user.id
    ) {
      throw new ForbiddenError();
    }

    if (listing.status !== "live" && session?.user?.role !== "admin" && session?.user?.role !== "landlord") {
      throw new NotFoundError("Listing not found");
    }

    return jsonOk(listing);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser(["landlord"]);
    const { id } = await params;
    const body = await request.json();
    const listing = await listingService.update(id, user.id, body);
    return jsonOk(listing);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser(["landlord"]);
    const { id } = await params;
    const result = await listingService.softDelete(id, user.id);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
