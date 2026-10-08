"use client";

import { CartLine } from "./PosTerminal";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
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
    <div className="flex h-full w-full min-w-0 flex-col md:border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 md:py-3.5 py-2 border-t md:border-t-0">
        <div className="flex items-center gap-2">
          <ShoppingBag aria-hidden="true" size={16} className="text-muted-fg" />
          <h2 className="text-sm font-semibold text-fg">Current order</h2>
          {itemCount > 0 && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium tabular-nums text-fg">
              {itemCount}
            </span>
          )}
        </div>
        {lines.length > 0 && (
          <button
            onClick={onClear}
            type="button"
            className="rounded-md px-1.5 py-1 text-xs font-medium text-muted-fg hover:bg-surface-muted hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-2">
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted-fg"
            >
              <ShoppingBag size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">No items yet</p>
              <p className="mt-1 text-xs text-muted-fg">
                Tap a product to start an order.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex items-center gap-3 rounded-lg border border-border p-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-lg leading-none">
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

      <div className="border-t border-border bg-surface p-4 py-2 md:py-4">
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
        <div className="md:mt-3 flex items-center justify-between border-t border-border md:pt-3 mt-1 pt-1">
          <span className="text-sm font-semibold text-fg">Total</span>
          <span className="text-xl font-bold tabular-nums text-fg">
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
        <button
          disabled={lines.length === 0}
          onClick={onCheckout}
          type="button"
          className="mt-2 md:mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:bg-surface-muted disabled:text-muted-fg disabled:shadow-none"
        >
          Charge {currencySymbol}
          {total.toFixed(2)}
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
