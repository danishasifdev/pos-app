"use client";

import { useMemo, useState } from "react";
import { Search, CheckCircle2, Printer } from "lucide-react";
import { Category, Product, Receipt, StoreSettings } from "@/lib/types";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { PaymentModal, PaymentMethod } from "./PaymentModal";
import { ReceiptPrintable } from "./ReceiptPrintable";
import { useToast } from "./ToastProvider";

export type CartLine = { product: Product; quantity: number };

export function PosTerminal({
  initialProducts,
  categories,
  settings,
}: {
  initialProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
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
    const existing = lines.find((line) => line.product.id === product.id);
    setLines((prev) => {
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(
      existing
        ? `${product.name} quantity increased`
        : `${product.name} added to order`,
      "success",
    );
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
  const total = Math.max(0, subtotal + taxTotal);

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
      <div className="flex min-h-0 flex-1 flex-col">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <div className="px-4 pt-3 md:px-6">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-fg outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={filteredProducts}
            currencySymbol={settings.currencySymbol}
            onAdd={addToCart}
          />
        </div>
      </div>

      <div className="h-[45vh] w-full shrink-0 md:h-auto md:w-96">
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
      </div>

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
          onClose={() => setCompletedReceipt(null)}
        />
      )}
    </div>
  );
}

function ReceiptSuccessModal({
  receipt,
  settings,
  onClose,
}: {
  receipt: Receipt;
  settings: StoreSettings;
  onClose: () => void;
}) {
  const { showToast } = useToast();

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
        className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-surface shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-fg">Payment complete</p>
            <p className="text-xs text-muted-fg">
              Receipt #{receipt.number} saved
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-surface-muted py-4">
          <ReceiptPrintable receipt={receipt} settings={settings} />
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-fg hover:bg-surface-muted"
          >
            Close
          </button>
          <button
            onClick={printReceipt}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
