import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { adminUsersService } from "@/lib/services/admin-users.service";

export async function GET() {
  try {
    await requireUser(["admin"]);
    const users = await adminUsersService.list();
    return jsonOk(users);
  } catch (error) {
    return jsonError(error);
  }
}
