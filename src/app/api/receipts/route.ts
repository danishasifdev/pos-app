import { NextRequest, NextResponse } from "next/server";
import {
  addReceipt,
  getProducts,
  getReceipts,
  getSettings,
  nextReceiptNumber,
} from "@/lib/db";
import { MAX_SAVED_RECORDS, Receipt, ReceiptItem } from "@/lib/types";
import { randomUUID } from "crypto";

export async function GET() {
  return NextResponse.json(getReceipts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cart: { productId: string; quantity: number }[] = body.cart ?? [];

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (getReceipts().length >= MAX_SAVED_RECORDS) {
    return NextResponse.json(
      {
        error: `Receipt limit reached. No more receipts can be saved (maximum ${MAX_SAVED_RECORDS}).`,
      },
      { status: 409 },
    );
  }

  const products = getProducts();
  const settings = getSettings();

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
  const paymentMethod = body.paymentMethod ?? "cash";
  const amountTendered =
    typeof body.amountTendered === "number" ? body.amountTendered : total;
  const changeDue = Math.max(0, amountTendered - total);

  const receipt: Receipt = {
    id: randomUUID(),
    number: nextReceiptNumber(),
    createdAt: new Date().toISOString(),
    items,
    subtotal: round2(subtotal),
    taxRate: settings.taxRate,
    taxTotal: round2(taxTotal),
    discount: round2(discount),
    total: round2(total),
    paymentMethod,
    amountTendered: round2(amountTendered),
    changeDue: round2(changeDue),
    cashier: body.cashier ?? "Front Register",
    note: body.note ?? undefined,
  };

  addReceipt(receipt);
  return NextResponse.json(receipt, { status: 201 });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
