import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonList<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
) {
  return NextResponse.json({ data, pagination });
}

export function jsonError(error: unknown) {
  const { status, body } = toErrorResponse(error);
  return NextResponse.json(body, { status });
}

export function notImplemented(feature: string) {
  return NextResponse.json(
    {
      error: {
        code: "NOT_IMPLEMENTED",
        message: `${feature} is not implemented yet. This route is a scaffold stub.`,
      },
    },
    { status: 501 },
  );
}
