"use client";

import { Category } from "@/lib/types";

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
    <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-4 md:px-6">
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
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-transparent text-white shadow-sm"
          : "border-border bg-surface text-fg hover:bg-surface-muted"
      }`}
      style={selected ? { backgroundColor: color } : undefined}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: selected ? "rgba(255,255,255,0.85)" : color }}
      />
      {label}
    </button>
  );
}
