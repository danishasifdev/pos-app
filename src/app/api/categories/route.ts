import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  return NextResponse.json(getCategories());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const categories = getCategories();
  const category = {
    id: `cat-${randomUUID()}`,
    name: body.name,
    color: body.color ?? "#64748b",
    sortOrder: categories.length,
  };
  categories.push(category);
  saveCategories(categories);
  return NextResponse.json(category, { status: 201 });
}
