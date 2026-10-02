import { ThemeName } from "./types";

export const THEMES: { id: ThemeName; label: string; swatch: string; dark?: boolean }[] = [
  { id: "slate", label: "Slate", swatch: "#475569" },
  { id: "emerald", label: "Emerald", swatch: "#047857" },
  { id: "indigo", label: "Indigo", swatch: "#4338ca" },
  { id: "rose", label: "Rose", swatch: "#be123c" },
  { id: "amber", label: "Amber", swatch: "#a85607" },
  { id: "midnight", label: "Midnight", swatch: "#17171a", dark: true },
];

export const DEFAULT_THEME: ThemeName = "slate";
export const THEME_STORAGE_KEY = "pos-theme";