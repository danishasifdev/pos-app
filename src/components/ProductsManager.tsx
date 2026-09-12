"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Category, Product } from "@/lib/types";
import { ConfirmationModal } from "./ConfirmationModal";

type Draft = {
  id?: string;
  name: string;
  price: string;
  categoryId: string;
  emoji: string;
  sku: string;
  taxable: boolean;
  active: boolean;
};
type Notice = { message: string; tone: "success" | "error" };

const EMPTY_DRAFT: Draft = {
  name: "",
  price: "",
  categoryId: "",
  emoji: "🛍️",
  sku: "",
  taxable: true,
  active: true,
};

export function ProductsManager({
  initialProducts,
  categories,
  currencySymbol,
}: {
  initialProducts: Product[];
  categories: Category[];
  currencySymbol: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openNew() {
    setDraft({ ...EMPTY_DRAFT, categoryId: categories[0]?.id ?? "" });
  }

  function openEdit(p: Product) {
    setDraft({
      id: p.id,
      name: p.name,
      price: String(p.price),
      categoryId: p.categoryId,
      emoji: p.emoji,
      sku: p.sku,
      taxable: p.taxable,
      active: p.active,
    });
  }

  async function save() {
    if (!draft || !draft.name.trim() || !draft.price) return;
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      price: parseFloat(draft.price) || 0,
      categoryId: draft.categoryId,
      emoji: draft.emoji || "🛍️",
      sku: draft.sku,
      taxable: draft.taxable,
      active: draft.active,
    };
    try {
      if (draft.id) {
        const res = await fetch(`/api/products/${draft.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        if (!res.ok)
          throw new Error(updated.error ?? "Could not update product");
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error ?? "Could not save product");
        setProducts((prev) => [...prev, created]);
      }
      setDraft(null);
      setNotice({ message: "Product saved", tone: "success" });
    } catch (e) {
      setNotice({
        message: e instanceof Error ? e.message : "Could not save product",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not delete product");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setNotice({ message: "Product deleted", tone: "success" });
    } catch (e) {
      setNotice({
        message: e instanceof Error ? e.message : "Could not delete product",
        tone: "error",
      });
    }
  }

  async function toggleActive(p: Product) {
    const updated = { ...p, active: !p.active };
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updated.active }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not update product");
      setProducts((prev) => prev.map((x) => (x.id === p.id ? body : x)));
      setNotice({ message: "Product updated", tone: "success" });
    } catch (e) {
      setNotice({
        message: e instanceof Error ? e.message : "Could not update product",
        tone: "error",
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-fg">Products</h1>
          <p className="text-sm text-muted-fg">
            {products.length} items in your catalog
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} />
          Add product
        </button>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs uppercase tracking-wide text-muted-fg">
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <tr key={p.id} className={!p.active ? "opacity-50" : ""}>
                  <td className="flex items-center gap-2 px-4 py-2.5">
                    <span className="text-lg">{p.emoji}</span>
                    <div>
                      <p className="font-medium text-fg">{p.name}</p>
                      <p className="text-xs text-muted-fg">{p.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: cat?.color ?? "#64748b" }}
                    >
                      {cat?.name ?? "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-fg">
                    {currencySymbol}
                    {p.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-surface-muted text-muted-fg"
                      }`}
                    >
                      {p.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-muted-fg hover:text-fg"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setPendingDelete(p)}
                        className="text-muted-fg hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDraft(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-fg">
                {draft.id ? "Edit product" : "New product"}
              </h2>
              <button
                onClick={() => setDraft(null)}
                className="text-muted-fg hover:text-fg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={draft.emoji}
                  onChange={(e) =>
                    setDraft({ ...draft, emoji: e.target.value })
                  }
                  className="w-14 rounded-lg border border-border bg-surface px-2 py-2 text-center text-lg"
                  maxLength={2}
                />
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Product name"
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  value={draft.price}
                  onChange={(e) =>
                    setDraft({ ...draft, price: e.target.value })
                  }
                  placeholder="Price"
                  inputMode="decimal"
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={draft.sku}
                  onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                  placeholder="SKU"
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <select
                value={draft.categoryId}
                onChange={(e) =>
                  setDraft({ ...draft, categoryId: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="checkbox"
                  checked={draft.taxable}
                  onChange={(e) =>
                    setDraft({ ...draft, taxable: e.target.checked })
                  }
                />
                Taxable
              </label>
            </div>

            <button
              onClick={save}
              disabled={saving || !draft.name.trim() || !draft.price}
              className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save product"}
            </button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmationModal
          title="Delete product?"
          message={`Delete ${pendingDelete.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            const id = pendingDelete.id;
            setPendingDelete(null);
            void remove(id);
          }}
        />
      )}
    </div>
  );
}
