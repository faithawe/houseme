import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    return jsonError(error);
  }
}
