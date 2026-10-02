import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";
import { getAdminTransactions } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return noStoreApiResponse({ error: "Forbidden" }, 403);
  }
  const accountId = request.nextUrl.searchParams.get("accountId") ?? undefined;
  return privateApiResponse({
    transactions: await getAdminTransactions(accountId),
  });
}
