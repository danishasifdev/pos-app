import { NextRequest, NextResponse } from "next/server";
import { getReceiptById, voidReceipt } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return noStoreApiResponse({ error: "Unauthorized" }, 401);
  }
  const { id } = await params;
  const receipt = await getReceiptById(user.id, id);
  if (!receipt) {
    return noStoreApiResponse({ error: "Receipt not found" }, 404);
  }
  return privateApiResponse(receipt);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const voided = await voidReceipt(user.id, id);
  if (!voided) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }
  return NextResponse.json(voided);
}
