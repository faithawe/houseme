import { auth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonOk({ user: null });
    }
    return jsonOk({ user: session.user });
  } catch (error) {
    return jsonError(error);
  }
}
