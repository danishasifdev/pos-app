"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Change theme"
        onClick={() => setOpen((v) => !v)}
        type="button"
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg hover:bg-surface-muted"
      >
        <Palette aria-hidden="true" size={16} />
        <span className="hidden sm:inline">Theme</span>
      </button>
      {open && (
        <div
          aria-label="Appearance"
          className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-surface p-2 shadow-lg"
          id={panelId}
          role="group"
        >
          <p className="px-2 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-muted-fg">
            Appearance
          </p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              aria-pressed={theme === t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-surface-muted"
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: t.swatch }}
              />
              <span className="flex-1 text-left text-fg">{t.label}</span>
              {theme === t.id && <Check aria-hidden="true" size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}