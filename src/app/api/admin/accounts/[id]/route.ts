import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteAccount, getAccountActivity, setAccountStatus } from "@/lib/db";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return noStoreApiResponse({ error: "Forbidden" }, 403);
  }
  const { id } = await params;
  return privateApiResponse({ activity: await getAccountActivity(id) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("status" in body) ||
    (body.status !== "active" && body.status !== "disabled")
  ) {
    return NextResponse.json({ error: "status must be active or disabled." }, { status: 400 });
  }
  const { id } = await params;
  const account = await setAccountStatus(id, body.status, {
    id: user.id,
    email: user.email,
  });
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ account });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const deleted = await deleteAccount(id, {
    id: user.id,
    email: user.email,
  });
  if (!deleted) {
    return NextResponse.json(
      { error: "Account not found or cannot be deleted." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
