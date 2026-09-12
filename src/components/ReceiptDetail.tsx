"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Ban } from "lucide-react";
import { Receipt, StoreSettings } from "@/lib/types";
import { ReceiptPrintable } from "./ReceiptPrintable";

export function ReceiptDetail({
  receipt,
  settings,
}: {
  receipt: Receipt;
  settings: StoreSettings;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(receipt);
  const [voiding, setVoiding] = useState(false);

  async function handleVoid() {
    if (!confirm(`Void receipt #${current.number}? This cannot be undone.`)) return;
    setVoiding(true);
    try {
      const res = await fetch(`/api/receipts/${current.id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = await res.json();
        setCurrent(updated);
        router.refresh();
      }
    } finally {
      setVoiding(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Link
        href="/receipts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-fg hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to receipts
      </Link>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h1 className="mb-1 text-lg font-semibold text-fg">Receipt #{current.number}</h1>
          <p className="mb-4 text-sm text-muted-fg">
            {new Date(current.createdAt).toLocaleString()} · {current.cashier}
          </p>

          <ul className="mb-4 divide-y divide-border">
            {current.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-fg">{item.name}</p>
                  <p className="text-xs text-muted-fg">
                    {item.quantity} × {settings.currencySymbol}
                    {item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium text-fg">
                  {settings.currencySymbol}
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <Row label="Subtotal" value={fmt(current.subtotal, settings.currencySymbol)} />
            <Row
              label={`Tax (${current.taxRate}%)`}
              value={fmt(current.taxTotal, settings.currencySymbol)}
            />
            {current.discount > 0 && (
              <Row label="Discount" value={`-${fmt(current.discount, settings.currencySymbol)}`} />
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-fg">
              <span>Total</span>
              <span>{fmt(current.total, settings.currencySymbol)}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Printer size={16} />
              Reprint
            </button>
            {!current.voided && (
              <button
                onClick={handleVoid}
                disabled={voiding}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Ban size={16} />
                Void
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted py-4">
          <ReceiptPrintable receipt={current} settings={settings} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-fg">
      <span>{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}

function fmt(n: number, symbol: string) {
  return `${symbol}${n.toFixed(2)}`;
}
