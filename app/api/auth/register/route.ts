import { authService } from "@/lib/services/auth.service";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.register(body);
    return jsonOk(result, 201);
  } catch (error) {
    return jsonError(error);
  }
}
