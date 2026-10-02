import { NextRequest, NextResponse } from "next/server";
import { addCategory, getCategories } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return noStoreApiResponse({ error: "Unauthorized" }, 401);
  }
  return privateApiResponse(await getCategories(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const categories = await getCategories(user.id);
  if (categories.length >= 20) {
    return NextResponse.json(
      { error: "Category limit reached (maximum 20)." },
      { status: 409 },
    );
  }
  const category = {
    id: `cat-${randomUUID()}`,
    name: body.name,
    color: body.color ?? "#64748b",
    sortOrder: categories.length,
  };
  const created = await addCategory(user.id, category);
  return NextResponse.json(created, { status: 201 });
}
