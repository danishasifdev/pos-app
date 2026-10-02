"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: string; message: string; tone: ToastTone };
type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = window.crypto.randomUUID();
      setToasts((current) => [{ id, message, tone }, ...current]);
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 grid max-h-[calc(100vh-2rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto"
        style={{ paddingBottom: `${Math.max(0, toasts.length - 1) * 14}px` }}
      >
        {toasts.map((toast, index) => (
          <div
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : toast.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-border bg-surface text-fg"
            }`}
            data-toast-id={toast.id}
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            style={{
              gridArea: "1 / 1",
              transform: `translate(${index * 5}px, ${index * 14}px) scale(${Math.max(0.94, 1 - index * 0.015)})`,
              zIndex: toasts.length - index,
              pointerEvents: index === 0 ? "auto" : "none",
            }}
          >
            <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
            <button
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                dismissToast(toast.id);
              }}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}
