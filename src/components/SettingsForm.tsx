"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { StoreSettings } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: StoreSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  async function save() {
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not save settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save settings",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <h1 className="mb-1 text-lg font-semibold text-fg">Store settings</h1>
      <p className="mb-6 text-sm text-muted-fg">
        Controls what prints on receipts and how the terminal looks.
      </p>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Store details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Store name">
            <input
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Address" full>
            <input
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Tax rate (%)">
            <input
              value={settings.taxRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  taxRate: parseFloat(e.target.value) || 0,
                })
              }
              inputMode="decimal"
              className="input"
            />
          </Field>
          <Field label="Currency symbol">
            <input
              value={settings.currencySymbol}
              onChange={(e) =>
                setSettings({ ...settings, currencySymbol: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Receipt footer" full>
            <input
              value={settings.receiptFooter}
              onChange={(e) =>
                setSettings({ ...settings, receiptFooter: e.target.value })
              }
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Appearance</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setSettings({ ...settings, theme: t.id });
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                theme === t.id
                  ? "border-primary bg-accent-soft"
                  : "border-border hover:bg-surface-muted"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: t.swatch }}
              />
              <span className="flex-1 text-left text-fg">{t.label}</span>
              {theme === t.id && <Check size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {saved ? "Saved ✓" : "Save changes"}
      </button>
      {saveError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {saveError}
        </p>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--fg);
          outline: none;
        }
        .input:focus {
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-fg">{label}</span>
      {children}
    </label>
  );
}
