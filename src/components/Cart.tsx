"use client";

import { CartLine } from "./PosTerminal";
import {
  ArrowRight,
  CircleAlert,
  LoaderCircle,
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
  mobileExpanded,
  onToggleMobile,
  receiptSaveState,
  receiptSaveError,
  onRetrySave,
  orderLocked,
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
  mobileExpanded: boolean;
  onToggleMobile: () => void;
  receiptSaveState: "saving" | "saved" | "error" | null;
  receiptSaveError: string;
  onRetrySave?: () => void;
  orderLocked: boolean;
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
    <div
      className={`flex w-full min-w-0 flex-col border-border bg-surface/95 md:h-full md:border-l md:bg-surface ${
        mobileExpanded ? "h-full" : "h-auto"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/80 border-t px-3 py-2 md:border-t-0 md:px-5 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-primary md:h-9 md:w-9">
            <ShoppingBag aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-fg">Current order</h2>
            <p className="mt-0.5 hidden text-[11px] text-muted-fg md:block">
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
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-bold tabular-nums text-fg md:hidden">
            {currencySymbol}
            {total.toFixed(2)}
          </span>
          {lines.length > 0 && (
            <button
              onClick={onClear}
              disabled={orderLocked}
              type="button"
              className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-fg hover:bg-surface-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
            >
              Clear
            </button>
          )}
          <button
            aria-expanded={mobileExpanded}
            aria-label={
              mobileExpanded ? "Hide order details" : "Show order details"
            }
            className="flex h-9 items-center gap-1 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-fg shadow-sm transition hover:bg-surface-muted md:hidden"
            onClick={onToggleMobile}
            type="button"
          >
            {mobileExpanded ? "Hide" : "Details"}
            {mobileExpanded ? (
              <Minus aria-hidden="true" size={14} />
            ) : (
              <Plus aria-hidden="true" size={14} />
            )}
          </button>
        </div>
      </div>

      {receiptSaveState === "saving" && (
        <div
          aria-live="polite"
          className="flex items-center gap-2.5 border-b border-primary/15 bg-accent-soft/50 px-3 py-2.5 text-xs text-fg md:px-4"
          role="status"
        >
          <LoaderCircle
            aria-hidden="true"
            className="shrink-0 animate-spin text-primary"
            size={16}
          />
          <span>
            <span className="font-semibold">Saving receipt…</span>{" "}
            Your order will clear once it is saved.
          </span>
        </div>
      )}
      {receiptSaveState === "error" && (
        <div
          aria-live="assertive"
          className="flex items-center gap-2.5 border-b border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800 md:px-4"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="shrink-0" size={16} />
          <span className="min-w-0 flex-1">
            <span className="font-semibold">Could not save receipt.</span>{" "}
            {receiptSaveError}
          </span>
          {onRetrySave && (
            <button
              className="shrink-0 rounded-lg bg-red-700 px-2.5 py-1.5 font-semibold text-white hover:bg-red-800"
              onClick={onRetrySave}
              type="button"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div
        className={`${mobileExpanded ? "flex" : "hidden"} min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 md:flex md:px-4`}
      >
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
                    disabled={orderLocked}
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-fg hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus aria-hidden="true" size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums text-fg">
                    {line.quantity}
                  </span>
                  <button
                    aria-label={`Increase quantity of ${line.product.name}`}
                    onClick={() => onIncrement(line.product.id)}
                    disabled={orderLocked}
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-fg hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus aria-hidden="true" size={13} />
                  </button>
                </div>
                <button
                  aria-label={`Remove ${line.product.name} from order`}
                  onClick={() => onRemove(line.product.id)}
                  disabled={orderLocked}
                  type="button"
                  className="rounded-md p-1.5 text-muted-fg hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 aria-hidden="true" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border/80 bg-surface px-3 py-2 md:p-5">
        <div className={mobileExpanded ? "block" : "hidden md:block"}>
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
        </div>
        <div
          className={`${mobileExpanded ? "mt-2 border-t pt-3 md:mt-3" : "hidden"} flex items-center justify-between border-border md:flex`}
        >
          <span className="text-sm font-semibold text-fg">Total</span>
          <span className="text-2xl font-bold tabular-nums tracking-tight text-fg">
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
        <button
          disabled={lines.length === 0 || orderLocked}
          onClick={onCheckout}
          type="button"
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-xl hover:shadow-primary/20 disabled:translate-y-0 disabled:bg-surface-muted disabled:text-muted-fg disabled:shadow-none ${
            mobileExpanded
              ? "mt-3 py-3.5"
              : "py-2.5 md:mt-3 md:py-3.5"
          }`}
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
