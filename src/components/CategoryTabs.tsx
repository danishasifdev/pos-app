"use client";

import { Category } from "@/lib/types";
import { chipStyle } from "@/lib/color";

export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: string | "all";
  onChange: (id: string | "all") => void;
}) {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 pt-3 md:px-6 md:pt-4">
      <TabButton
        label="All items"
        selected={active === "all"}
        color="var(--primary)"
        onClick={() => onChange("all")}
      />
      {categories
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => (
          <TabButton
            key={c.id}
            label={c.name}
            selected={active === c.id}
            color={c.color}
            onClick={() => onChange(c.id)}
          />
        ))}
    </div>
  );
}

function TabButton({
  label,
  selected,
  color,
  onClick,
}: {
  label: string;
  selected: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      onClick={onClick}
      type="button"
      className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition duration-150 sm:text-sm ${
        selected
          ? "border-transparent shadow-sm ring-1 ring-black/5"
          : "border-border/80 bg-surface/80 text-muted-fg hover:border-primary/30 hover:bg-surface hover:text-fg"
      }`}
      style={selected ? chipStyle(color) : undefined}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${selected ? "bg-current opacity-75" : ""}`}
        style={selected ? undefined : { backgroundColor: color }}
      />
      {label}
    </button>
  );
}
