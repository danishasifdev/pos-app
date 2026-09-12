import { ThemeName } from "./types";

export const THEMES: { id: ThemeName; label: string; swatch: string; dark?: boolean }[] = [
  { id: "slate", label: "Slate", swatch: "#475569" },
  { id: "emerald", label: "Emerald", swatch: "#059669" },
  { id: "indigo", label: "Indigo", swatch: "#4f46e5" },
  { id: "rose", label: "Rose", swatch: "#e11d48" },
  { id: "amber", label: "Amber", swatch: "#d97706" },
  { id: "midnight", label: "Midnight", swatch: "#0f172a", dark: true },
];

export const DEFAULT_THEME: ThemeName = "slate";
export const THEME_STORAGE_KEY = "pos-theme";
