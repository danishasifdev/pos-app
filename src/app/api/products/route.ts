import { NextRequest, NextResponse } from "next/server";
import { addProduct, getProducts } from "@/lib/db";
import { randomUUID } from "crypto";
import { MAX_SAVED_RECORDS } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getProducts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || typeof body.price !== "number") {
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
    name: body.name,
    price: body.price,
    categoryId: body.categoryId ?? "cat-snacks",
    emoji: body.emoji ?? "🛍️",
    sku: body.sku ?? "",
    taxable: body.taxable ?? true,
    active: body.active ?? true,
  });

  return NextResponse.json(product, { status: 201 });
}
