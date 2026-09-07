import { jsonError, jsonOk } from "@/lib/api-response";
import { newsletterService } from "@/lib/services/newsletter.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await newsletterService.subscribe(body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
