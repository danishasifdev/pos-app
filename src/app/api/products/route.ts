import { NextRequest, NextResponse } from "next/server";
import { addProduct, getCategories, getProducts } from "@/lib/db";
import { randomUUID } from "crypto";
import { MAX_SAVED_RECORDS } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return noStoreApiResponse({ error: "Unauthorized" }, 401);
  }
  return privateApiResponse(await getProducts(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  if (
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.price !== "number"
  ) {
    return NextResponse.json(
      { error: "name and numeric price are required" },
      { status: 400 },
    );
  }

  if ((await getProducts(user.id)).length >= MAX_SAVED_RECORDS) {
    return NextResponse.json(
      {
        error: `Product limit reached. Delete a product to add another (maximum ${MAX_SAVED_RECORDS}).`,
      },
      { status: 409 },
    );
  }

  const categories = await getCategories(user.id);
  if (!categories.length) {
    return NextResponse.json(
      { error: "Create a category before adding products." },
      { status: 409 },
    );
  }
  const product = await addProduct(user.id, {
    id: `p-${randomUUID()}`,
    name: body.name.trim(),
    price: body.price,
    categoryId:
      typeof body.categoryId === "string"
        ? body.categoryId
        : categories[0].id,
    emoji: typeof body.emoji === "string" ? body.emoji : "🛍️",
    sku: typeof body.sku === "string" ? body.sku : "",
    taxable: typeof body.taxable === "boolean" ? body.taxable : true,
    active: typeof body.active === "boolean" ? body.active : true,
  });

  return NextResponse.json(product, { status: 201 });
}
