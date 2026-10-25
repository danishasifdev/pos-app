"use client";

import { CartLine } from "./PosTerminal";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { round2 } from "@/lib/format";

export function Cart({
  lines,
  currencySymbol,
  taxRate,
  discount,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onCheckout,
}: {
  lines: CartLine[];
  currencySymbol: string;
  taxRate: number;
  discount: number;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}) {
  const subtotal = round2(
    lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
  );
  const taxTotal = round2(
    lines.reduce(
      (sum, l) =>
        sum +
        (l.product.taxable
          ? l.product.price * l.quantity * (taxRate / 100)
          : 0),
      0,
    ),
  );
  const total = Math.max(0, round2(subtotal + taxTotal - discount));
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="flex h-full w-full min-w-0 flex-col border-border bg-surface/95 md:border-l md:bg-surface">
      <div className="flex items-center justify-between border-b border-border/80 border-t px-4 py-3 md:border-t-0 md:px-5 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-primary">
            <ShoppingBag aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-fg">Current order</h2>
            <p className="mt-0.5 text-[11px] text-muted-fg">
              {itemCount > 0
                ? `${itemCount} ${itemCount === 1 ? "item" : "items"} added`
                : "Your order starts here"}
            </p>
          </div>
          {itemCount > 0 && (
            <span className="rounded-full bg-surface-muted px-2 py-1 text-xs font-semibold tabular-nums text-fg">
              {itemCount}
            </span>
          )}
        </div>
        {lines.length > 0 && (
          <button
            onClick={onClear}
            type="button"
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-fg hover:bg-surface-muted hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-3 md:px-4">
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-4 text-center">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-surface-muted text-primary shadow-inner"
            >
              <ShoppingBag size={23} />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">Nothing in your order yet</p>
              <p className="mt-1 max-w-52 text-xs leading-5 text-muted-fg">
                Choose a product to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface p-2.5 shadow-sm"
              >
                <div                 className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-lg leading-none">
                  <span aria-hidden="true">{line.product.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">
                    {line.product.name}
                  </p>
                  <p className="text-xs text-muted-fg">
                    {currencySymbol}
                    {line.product.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Decrease quantity of ${line.product.name}`}
                    onClick={() => onDecrement(line.product.id)}
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-fg hover:bg-surface-muted"
                  >
                    <Minus aria-hidden="true" size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums text-fg">
                    {line.quantity}
                  </span>
                  <button
                    aria-label={`Increase quantity of ${line.product.name}`}
                    onClick={() => onIncrement(line.product.id)}
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-fg hover:bg-surface-muted"
                  >
                    <Plus aria-hidden="true" size={13} />
                  </button>
                </div>
                <button
                  aria-label={`Remove ${line.product.name} from order`}
                  onClick={() => onRemove(line.product.id)}
                  type="button"
                  className="rounded-md p-1.5 text-muted-fg hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 aria-hidden="true" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border/80 bg-surface p-4 md:p-5">
        <SummaryRow
          label="Subtotal"
          value={`${currencySymbol}${subtotal.toFixed(2)}`}
        />
        <SummaryRow
          label={`Tax (${taxRate}%)`}
          value={`${currencySymbol}${taxTotal.toFixed(2)}`}
        />
        {discount > 0 && (
          <SummaryRow
            label="Discount"
            value={`-${currencySymbol}${discount.toFixed(2)}`}
          />
        )}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3 md:mt-3">
          <span className="text-sm font-semibold text-fg">Total</span>
          <span className="text-2xl font-bold tabular-nums tracking-tight text-fg">
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
        <button
          disabled={lines.length === 0}
          onClick={onCheckout}
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-xl hover:shadow-primary/20 disabled:translate-y-0 disabled:bg-surface-muted disabled:text-muted-fg disabled:shadow-none"
        >
          Charge {currencySymbol}
          {total.toFixed(2)}
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-fg">{label}</span>
      <span className="tabular-nums text-fg">{value}</span>
    </div>
  );
}
