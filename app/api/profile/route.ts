import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { profileService } from "@/lib/services/profile.service";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await profileService.getByUserId(user.id);
    return jsonOk(profile);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const profile = await profileService.update(user.id, body);
    return jsonOk(profile);
  } catch (error) {
    return jsonError(error);
  }
}
