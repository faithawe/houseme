import { jsonError, jsonOk } from "@/lib/api-response";
import { authService } from "@/lib/services/auth.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") ?? "";
    const result = await authService.verifyEmail(token);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { token?: string };
    const result = await authService.verifyEmail(body.token ?? "");
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
