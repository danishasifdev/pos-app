import { NextRequest, NextResponse } from "next/server";
import { addProduct, getProducts } from "@/lib/db";
import { randomUUID } from "crypto";
import { MAX_SAVED_RECORDS } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getProducts());
}

export async function POST(req: NextRequest) {
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

  if (getProducts().length >= MAX_SAVED_RECORDS) {
    return NextResponse.json(
      {
        error: `Product limit reached. Delete a product to add another (maximum ${MAX_SAVED_RECORDS}).`,
      },
      { status: 409 },
    );
  }

  const product = addProduct({
    id: `p-${randomUUID()}`,
    name: body.name.trim(),
    price: body.price,
    categoryId:
      typeof body.categoryId === "string" ? body.categoryId : "cat-snacks",
    emoji: typeof body.emoji === "string" ? body.emoji : "🛍️",
    sku: typeof body.sku === "string" ? body.sku : "",
    taxable: typeof body.taxable === "boolean" ? body.taxable : true,
    active: typeof body.active === "boolean" ? body.active : true,
  });

  return NextResponse.json(product, { status: 201 });
}
