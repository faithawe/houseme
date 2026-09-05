import { authService } from "@/lib/services/auth.service";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.requestPasswordReset(body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
