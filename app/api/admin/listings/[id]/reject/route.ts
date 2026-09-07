import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { adminService } from "@/lib/services/admin.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireUser(["admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const result = await adminService.reject(id, admin.id, body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
