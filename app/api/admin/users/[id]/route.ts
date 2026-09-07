import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { adminUsersService } from "@/lib/services/admin-users.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireUser(["admin"]);
    const { id } = await params;
    const result = await adminUsersService.softDelete(id);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
