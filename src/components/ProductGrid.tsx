"use client";

import { Product } from "@/lib/types";
import { Plus, ShoppingCart } from "lucide-react";

export function ProductGrid({
  products,
  currencySymbol,
  onAdd,
  disabled = false,
}: {
  products: Product[];
  currencySymbol: string;
  onAdd: (product: Product) => void;
  disabled?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-muted-fg">
          <ShoppingCart aria-hidden="true" size={20} />
        </span>
        <p className="text-sm font-semibold text-fg">No products found</p>
        <p className="text-xs text-muted-fg">
          Try another search or choose a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2.5 px-4 py-3 sm:grid-cols-3 md:gap-3 md:px-6 md:py-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          onClick={() => onAdd(product)}
          disabled={disabled}
          aria-label={`Add ${product.name} for ${currencySymbol}${product.price.toFixed(2)}`}
          className="group relative flex min-h-36 w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-3 text-left shadow-sm outline-none transition duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:min-h-40 sm:p-3.5"
        >
          <div className="flex w-full items-start justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-[26px] leading-none ring-1 ring-black/[0.025] sm:h-14 sm:w-14 sm:text-[30px]">
              <span aria-hidden="true">{product.emoji}</span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border/80 text-muted-fg transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
            >
              <Plus size={15} strokeWidth={2.25} />
            </span>
          </div>

          <p className="mt-3 line-clamp-2 min-h-5 w-full flex-1 text-left text-sm font-medium leading-5 text-fg">
            {product.name}
          </p>

          <p className="mt-1 text-sm font-bold tabular-nums text-fg sm:text-base">
            {currencySymbol}
            {product.price.toFixed(2)}
          </p>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/[0.06] opacity-0 transition-opacity duration-150 group-focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <span className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-150 group-focus-visible:scale-100 group-active:scale-90 [@media(hover:hover)]:group-hover:scale-100">
              <ShoppingCart size={20} strokeWidth={2.25} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
