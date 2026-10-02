"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Receipt as ReceiptIcon, Banknote, CreditCard, Smartphone } from "lucide-react";
import { Receipt } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const METHOD_ICON = { cash: Banknote, card: CreditCard, mobile: Smartphone } as const;

export function ReceiptsList({
  receipts,
  currencySymbol,
}: {
  receipts: Receipt[];
  currencySymbol: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (r) =>
        r.number.toLowerCase().includes(q) ||
        r.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [receipts, query]);

  const todayTotal = receipts
    .filter((r) => !r.voided && isToday(r.createdAt))
    .reduce((s, r) => s + r.total, 0);

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-fg">Receipts</h1>
          <p className="text-sm text-muted-fg">
            {receipts.length} saved · {currencySymbol}
            {todayTotal.toFixed(2)} taken today
          </p>
        </div>
        <div className="relative">
          <Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" />
          <input
            aria-label="Search receipts"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by receipt # or item…"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg shadow-sm outline-none transition-colors placeholder:text-muted-fg focus:border-primary sm:w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <ReceiptIcon aria-hidden="true" size={28} className="text-muted-fg" />
          <p className="text-sm font-medium text-fg">No receipts found</p>
          <p className="text-xs text-muted-fg">Sales you complete will show up here automatically.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((r) => {
            const Icon = METHOD_ICON[r.paymentMethod];
            return (
              <li key={r.id}>
                <Link
                  href={`/receipts/${r.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/40 hover:bg-surface-muted"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                    <Icon aria-hidden="true" size={16} className="text-fg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-fg">#{r.number}</p>
                      {r.voided && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-800">
                          Voided
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-fg">
                      {r.items.map((i) => i.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-fg">
                      {currencySymbol}
                      {r.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-fg">
                      {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
