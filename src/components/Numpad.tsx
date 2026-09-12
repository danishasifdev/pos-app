"use client";

import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export function Numpad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onKey(key)}
          className="flex h-12 items-center justify-center rounded-lg border border-border bg-surface text-lg font-medium text-fg hover:bg-surface-muted active:bg-accent-soft"
        >
          {key === "back" ? <Delete size={18} /> : key}
        </button>
      ))}
    </div>
  );
}
