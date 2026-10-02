"use client";

import { Category } from "@/lib/types";
import { readableTextColor } from "@/lib/color";

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
    <div className="flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 pt-4 md:px-6">
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
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? "border-transparent shadow-sm"
          : "border-border bg-surface text-fg hover:bg-surface-muted"
      }`}
      style={selected ? { backgroundColor: color, color: readableTextColor(color) } : undefined}
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
