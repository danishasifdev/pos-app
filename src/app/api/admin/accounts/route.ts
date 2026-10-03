import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listAccounts } from "@/lib/db";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const params = request.nextUrl.searchParams;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(params.get("limit")) || DEFAULT_LIMIT),
  );
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const query = (params.get("q") ?? "").trim().toLowerCase();

  const all = await listAccounts();
  const filtered = query
    ? all.filter(
        (account) =>
          account.email.toLowerCase().includes(query) ||
          account.role.includes(query),
      )
    : all;

  return NextResponse.json(
    {
      accounts: filtered.slice(offset, offset + limit),
      total: filtered.length,
      offset,
      limit,
    },
    { headers: { "Cache-Control": "private, max-age=10, must-revalidate" } },
  );
}
