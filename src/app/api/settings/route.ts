import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(req: NextRequest) {
  const patch = await req.json();
  const current = getSettings();
  const updated = { ...current, ...patch };
  saveSettings(updated);
  return NextResponse.json(updated);
}
