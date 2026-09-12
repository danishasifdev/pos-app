"use client";

import { CartLine } from "./PosTerminal";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

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
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const taxTotal = lines.reduce(
    (sum, l) => sum + (l.product.taxable ? l.product.price * l.quantity * (taxRate / 100) : 0),
    0
  );
  const total = Math.max(0, subtotal + taxTotal - discount);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-muted-fg" />
          <h2 className="text-sm font-semibold text-fg">Current order</h2>
          {itemCount > 0 && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-fg">
              {itemCount}
            </span>
          )}
        </div>
        {lines.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-muted-fg hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-fg">Cart is empty</p>
            <p className="text-xs text-muted-fg">Tap a product to add it here.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex items-center gap-3 rounded-lg border border-border p-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-lg">
                  {line.product.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{line.product.name}</p>
                  <p className="text-xs text-muted-fg">
                    {currencySymbol}
                    {line.product.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDecrement(line.product.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-fg hover:bg-surface-muted"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-fg">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => onIncrement(line.product.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-fg hover:bg-surface-muted"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(line.product.id)}
                  className="text-muted-fg hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border p-4">
        <SummaryRow label="Subtotal" value={`${currencySymbol}${subtotal.toFixed(2)}`} />
        <SummaryRow label={`Tax (${taxRate}%)`} value={`${currencySymbol}${taxTotal.toFixed(2)}`} />
        {discount > 0 && (
          <SummaryRow label="Discount" value={`-${currencySymbol}${discount.toFixed(2)}`} />
        )}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm font-semibold text-fg">Total</span>
          <span className="text-lg font-bold text-fg">
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
        <button
          disabled={lines.length === 0}
          onClick={onCheckout}
          className="mt-3 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted-fg">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}
