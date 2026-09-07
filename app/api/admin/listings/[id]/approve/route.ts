import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { adminService } from "@/lib/services/admin.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const admin = await requireUser(["admin"]);
    const { id } = await params;
    const result = await adminService.approve(id, admin.id);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
