import { NextRequest, NextResponse } from "next/server";
import {
  addWorkspaceReceipt,
  getWorkspaceProducts,
  getWorkspaceReceipts,
  getWorkspaceSettings,
} from "@/lib/workspace";
import { MAX_SAVED_RECORDS, Receipt, ReceiptItem } from "@/lib/types";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { noStoreApiResponse, privateApiResponse } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    return noStoreApiResponse({ error: "Unauthorized" }, 401);
  }
  return privateApiResponse(await getWorkspaceReceipts(user));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
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
  const cart = Array.isArray(body.cart) ? body.cart.filter(isCartLine) : [];

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if ((await getWorkspaceReceipts(user)).length >= MAX_SAVED_RECORDS) {
    return NextResponse.json(
      {
        error: `Receipt limit reached. No more receipts can be saved (maximum ${MAX_SAVED_RECORDS}).`,
      },
      { status: 409 },
    );
  }

  const [products, settings] = await Promise.all([
    getWorkspaceProducts(user),
    getWorkspaceSettings(user),
  ]);

  // Recompute everything from the authoritative product list on the server
  // so a tampered client request can never change what actually gets billed.
  const items: ReceiptItem[] = [];
  let subtotal = 0;
  let taxTotal = 0;

  for (const line of cart) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || line.quantity < 1) continue;
    const lineTotal = product.price * line.quantity;
    subtotal += lineTotal;
    if (product.taxable) taxTotal += lineTotal * (settings.taxRate / 100);
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
    });
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "No valid items in cart" },
      { status: 400 },
    );
  }

  const discount =
    typeof body.discount === "number" ? Math.max(0, body.discount) : 0;
  const total = Math.max(0, subtotal + taxTotal - discount);
  const roundedTotal = round2(total);
  const paymentMethod = isPaymentMethod(body.paymentMethod)
    ? body.paymentMethod
    : "cash";
  const amountTendered =
    typeof body.amountTendered === "number" ? body.amountTendered : roundedTotal;
  // derived from the rounded total, otherwise the printed receipt can show
  // total + change !== tendered (e.g. 9.77 + 40.24 against 50.00 tendered)
  const changeDue = Math.max(0, round2(amountTendered) - roundedTotal);

  const receipt: Omit<Receipt, "number"> = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    items,
    subtotal: round2(subtotal),
    taxRate: settings.taxRate,
    taxTotal: round2(taxTotal),
    discount: round2(discount),
    total: roundedTotal,
    paymentMethod,
    amountTendered: round2(amountTendered),
    changeDue: round2(changeDue),
    cashier: typeof body.cashier === "string" ? body.cashier : "Front Register",
    note: typeof body.note === "string" ? body.note : undefined,
  };

  const savedReceipt = await addWorkspaceReceipt(user, receipt);
  return NextResponse.json(savedReceipt, { status: 201 });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function isCartLine(
  value: unknown,
): value is { productId: string; quantity: number } {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" && typeof line.quantity === "number"
  );
}

function isPaymentMethod(value: unknown): value is Receipt["paymentMethod"] {
  return value === "cash" || value === "card" || value === "mobile";
}
