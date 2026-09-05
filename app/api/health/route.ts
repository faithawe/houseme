import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "houseme",
    timestamp: new Date().toISOString(),
  });
}
