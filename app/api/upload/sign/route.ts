import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/guards";
import { uploadService } from "@/lib/services/upload.service";

export async function GET(request: Request) {
  try {
    await requireUser(["landlord", "tenant", "admin"]);
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || "photo.jpg";

    if (!uploadService.isConfigured()) {
      return jsonOk({ configured: false as const });
    }

    const signed = await uploadService.sign(filename);
    return jsonOk({ configured: true as const, ...signed });
  } catch (error) {
    return jsonError(error);
  }
}
