"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { Search, CheckCircle2, Printer } from "lucide-react";
import { Category, Product, Receipt, StoreSettings } from "@/lib/types";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { ResizablePanel } from "./ResizablePanel";
import { PaymentModal, PaymentMethod } from "./PaymentModal";
import { ReceiptPrintable } from "./ReceiptPrintable";
import { round2 } from "@/lib/format";
import { useToast } from "./ToastProvider";
import { useModal } from "./useModal";

export type CartLine = { product: Product; quantity: number };

export function PosTerminal({
  initialProducts,
  categories,
  settings,
  signedIn = true,
}: {
  initialProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
  signedIn?: boolean;
}) {
  const { showToast } = useToast();
  const [products] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<Receipt | null>(
    null,
  );
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (activeCategory !== "all" && p.categoryId !== activeCategory)
        return false;
      if (
        search.trim() &&
        !p.name.toLowerCase().includes(search.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, activeCategory, search]);

  function addToCart(product: Product) {
    // The lookup has to happen inside the updater. Reading `lines` from the
    // render closure instead makes every call in a single batch observe the
    // same stale array, so N taps dispatched in one tick append N duplicate
    // rows of quantity 1 rather than incrementing one row.
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`${product.name} added to order`, "success");
  }

  function increment(id: string) {
    const line = lines.find((item) => item.product.id === id);
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === id ? { ...l, quantity: l.quantity + 1 } : l,
      ),
    );
    if (line) showToast(`${line.product.name} quantity increased`);
  }

  function decrement(id: string) {
    const line = lines.find((item) => item.product.id === id);
    setLines((prev) =>
      prev
        .map((l) =>
          l.product.id === id ? { ...l, quantity: l.quantity - 1 } : l,
        )
        .filter((l) => l.quantity > 0),
    );
    if (line) {
      showToast(
        line.quantity === 1
          ? `${line.product.name} removed`
          : `${line.product.name} quantity decreased`,
      );
    }
  }

  function remove(id: string) {
    const line = lines.find((item) => item.product.id === id);
    setLines((prev) => prev.filter((l) => l.product.id !== id));
    if (line) showToast(`${line.product.name} removed from order`);
  }

  function clearCart(showNotification = true) {
    setLines([]);
    if (showNotification) showToast("Order cleared");
  }

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const taxTotal = lines.reduce(
    (s, l) =>
      s +
      (l.product.taxable
        ? l.product.price * l.quantity * (settings.taxRate / 100)
        : 0),
    0,
  );
  const total = round2(Math.max(0, subtotal + taxTotal));

  async function confirmPayment(method: PaymentMethod, tendered: number) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
          })),
          paymentMethod: method,
          amountTendered: tendered,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save the receipt");
      }
      const receipt: Receipt = await res.json();
      setCompletedReceipt(receipt);
      setShowPayment(false);
      clearCart(false);
      showToast(`Payment complete · Receipt #${receipt.number}`, "success");
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Something went wrong",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col md:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <h1 className="sr-only">Point of sale terminal</h1>
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <div className="px-4 pt-3 md:px-6">
          <div className="relative">
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg"
            />
            <input
              aria-label="Search products"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg shadow-sm outline-none transition-colors placeholder:text-muted-fg focus:border-primary"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ProductGrid
            products={filteredProducts}
            currencySymbol={settings.currencySymbol}
            onAdd={addToCart}
          />
        </div>
      </div>

      <ResizablePanel>
        <Cart
          lines={lines}
          currencySymbol={settings.currencySymbol}
          taxRate={settings.taxRate}
          discount={0}
          onIncrement={increment}
          onDecrement={decrement}
          onRemove={remove}
          onClear={clearCart}
          onCheckout={() => setShowPayment(true)}
        />
      </ResizablePanel>

      {showPayment && (
        <PaymentModal
          total={total}
          currencySymbol={settings.currencySymbol}
          submitting={submitting}
          onClose={() => setShowPayment(false)}
          onConfirm={confirmPayment}
        />
      )}

      {completedReceipt && (
        <ReceiptSuccessModal
          receipt={completedReceipt}
          settings={settings}
          signedIn={signedIn}
          onClose={() => setCompletedReceipt(null)}
        />
      )}
    </div>
  );
}

function ReceiptSuccessModal({
  receipt,
  settings,
  signedIn,
  onClose,
}: {
  receipt: Receipt;
  settings: StoreSettings;
  signedIn: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModal(dialogRef, onClose);

  function printReceipt() {
    try {
      window.print();
    } catch {
      showToast("Printing is unavailable in this browser.", "error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-surface shadow-xl focus:outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <CheckCircle2
            aria-hidden="true"
            size={20}
            className="text-emerald-500"
          />
          <div>
            <p className="text-sm font-semibold text-fg" id={titleId}>
              Payment complete
            </p>
            <p className="text-xs text-muted-fg">
              Receipt #{receipt.number} saved
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-surface-muted py-4">
          <ReceiptPrintable receipt={receipt} settings={settings} />
        </div>
        {!signedIn && (
          <p className="border-t border-border bg-accent-soft px-5 py-3 text-xs text-fg">
            <strong className="font-semibold">Not saved.</strong> You are signed
            out, so this receipt went to a temporary file and will be gone when
            you reload.{" "}
            <Link className="font-semibold underline" href="/register">
              Create a free account
            </Link>{" "}
            to keep it.
          </p>
        )}
        <div className="flex gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-fg hover:bg-surface-muted"
          >
            Close
          </button>
          <button
            onClick={printReceipt}
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Printer aria-hidden="true" size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
