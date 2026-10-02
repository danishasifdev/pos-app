import { timingSafeEqual, createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { expireInactiveAccounts } from "@/lib/db";

export const runtime = "nodejs";

function matches(actual: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(actual).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron secret is not configured." }, { status: 503 });
  }
  const authorization = request.headers.get("authorization") ?? "";
  if (!matches(authorization, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const disabledCount = await expireInactiveAccounts();
  return NextResponse.json({ disabledCount });
}
