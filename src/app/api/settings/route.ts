import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ThemeName } from "@/lib/types";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";

const THEMES: ThemeName[] = [
  "slate",
  "emerald",
  "indigo",
  "rose",
  "amber",
  "midnight",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return noStoreApiResponse({ error: "Unauthorized" }, 401);
  }
  return privateApiResponse(await getSettings(user.id));
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let patch: Record<string, unknown>;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }
  const current = await getSettings(user.id);
  const updated = {
    ...current,
    ...(typeof patch.storeName === "string" ? { storeName: patch.storeName } : {}),
    ...(typeof patch.address === "string" ? { address: patch.address } : {}),
    ...(typeof patch.phone === "string" ? { phone: patch.phone } : {}),
    ...(typeof patch.taxRate === "number" ? { taxRate: patch.taxRate } : {}),
    ...(typeof patch.currencySymbol === "string" ? { currencySymbol: patch.currencySymbol } : {}),
    ...(typeof patch.receiptFooter === "string" ? { receiptFooter: patch.receiptFooter } : {}),
    ...(typeof patch.theme === "string" && THEMES.includes(patch.theme as ThemeName)
      ? { theme: patch.theme as ThemeName }
      : {}),
  };
  await saveSettings(user.id, updated);
  return NextResponse.json(updated);
}
