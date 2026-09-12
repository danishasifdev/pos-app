"use client";

import { useState } from "react";
import { X, Banknote, CreditCard, Smartphone } from "lucide-react";
import { Numpad } from "./Numpad";

export type PaymentMethod = "cash" | "card" | "mobile";

export function PaymentModal({
  total,
  currencySymbol,
  submitting,
  onClose,
  onConfirm,
}: {
  total: number;
  currencySymbol: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, tendered: number) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tendered, setTendered] = useState("");

  const tenderedValue = tendered === "" ? total : parseFloat(tendered) || 0;
  const changeDue = Math.max(0, tenderedValue - total);

  function handleKey(key: string) {
    if (key === "back") {
      setTendered((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "." && tendered.includes(".")) return;
    setTendered((prev) => (prev + key).slice(0, 9));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-fg">Take payment</h2>
          <button onClick={onClose} className="text-muted-fg hover:text-fg">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
          Amount due
        </p>
        <p className="mb-4 text-3xl font-bold text-fg">
          {currencySymbol}
          {total.toFixed(2)}
        </p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <MethodButton
            icon={Banknote}
            label="Cash"
            active={method === "cash"}
            onClick={() => setMethod("cash")}
          />
          <MethodButton
            icon={CreditCard}
            label="Card"
            active={method === "card"}
            onClick={() => setMethod("card")}
          />
          <MethodButton
            icon={Smartphone}
            label="Mobile"
            active={method === "mobile"}
            onClick={() => setMethod("mobile")}
          />
        </div>

        {method === "cash" && (
          <>
            <div className="mb-3 flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
              <span className="text-xs text-muted-fg">Tendered</span>
              <span className="text-lg font-semibold text-fg">
                {currencySymbol}
                {tenderedValue.toFixed(2)}
              </span>
            </div>
            <Numpad onKey={handleKey} />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-fg">Change due</span>
              <span className="font-semibold text-fg">
                {currencySymbol}
                {changeDue.toFixed(2)}
              </span>
            </div>
          </>
        )}

        {method !== "cash" && (
          <p className="mb-2 rounded-lg bg-surface-muted px-3 py-3 text-center text-xs text-muted-fg">
            Confirm once the {method === "card" ? "card" : "mobile wallet"} payment has gone
            through on your terminal.
          </p>
        )}

        <button
          disabled={submitting}
          onClick={() => onConfirm(method, tenderedValue)}
          className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Processing…" : "Confirm & print receipt"}
        </button>
      </div>
    </div>
  );
}

function MethodButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Banknote;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium ${
        active
          ? "border-primary bg-accent-soft text-fg"
          : "border-border text-muted-fg hover:bg-surface-muted"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
