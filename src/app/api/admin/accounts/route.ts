import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listAccounts } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // listAccounts already expires inactive accounts internally
  return NextResponse.json({ accounts: await listAccounts(), limit: 25 });
}
