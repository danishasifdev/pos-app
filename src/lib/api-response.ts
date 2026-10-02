import { NextResponse } from "next/server";

const PRIVATE_READ_CACHE_SECONDS = 10;

export function privateApiResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `private, max-age=${PRIVATE_READ_CACHE_SECONDS}, must-revalidate`,
      Vary: "Cookie",
    },
  });
}

export function noStoreApiResponse<T>(
  data: T,
  status: number,
): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
