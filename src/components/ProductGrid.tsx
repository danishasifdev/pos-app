"use client";

import { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";

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
    <div className="grid min-w-0 grid-cols-2 gap-2 md:gap-3 px-4 py-2 lg:grid-cols-4 xl:grid-cols-5 md:p-6">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} for ${currencySymbol}${product.price.toFixed(2)}`}
          className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-3 text-left shadow-sm outline-none transition duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 active:translate-y-0 active:scale-[0.97] active:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 gap-1 md:gap-2 lg:gap-3 sm:p-3.5 items-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-[26px] leading-none sm:h-14 sm:w-14 sm:text-[30px]">
            <span aria-hidden="true">{product.emoji}</span>
          </div>

          <p className="line-clamp-2 flex-1 text-sm font-medium text-center leading-5 text-fg">
            {product.name}
          </p>

          <p className="text-sm font-semibold tabular-nums text-fg sm:text-base">
            {currencySymbol}
            {product.price.toFixed(2)}
          </p>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <span className="flex h-11 w-11 scale-75 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-150 group-focus-visible:scale-100 group-active:scale-90 [@media(hover:hover)]:group-hover:scale-100">
              <ShoppingCart size={20} strokeWidth={2.25} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
