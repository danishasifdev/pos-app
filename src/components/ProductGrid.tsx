"use client";

import { Product } from "@/lib/types";
import { Plus } from "lucide-react";

export function ProductGrid({
  products,
  currencySymbol,
  onAdd,
}: {
  products: Product[];
  currencySymbol: string;
  onAdd: (product: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
        <p className="text-sm font-medium text-fg">No products here yet</p>
        <p className="text-xs text-muted-fg">
          Add products from the Products page or pick another category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:p-6">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onAdd(product)}
          className="group relative flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-muted text-2xl">
            {product.emoji}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-fg">{product.name}</p>
            <p className="text-xs text-muted-fg">
              {currencySymbol}
              {product.price.toFixed(2)}
            </p>
          </div>
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition group-hover:opacity-100">
            <Plus size={14} />
          </span>
        </button>
      ))}
    </div>
  );
}
