"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export function LogoutButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function logout() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        showToast("Could not sign out. Please try again.", "error");
        return;
      }
      showToast("You have signed out.", "success");
      router.replace("/login");
      router.refresh();
    } catch {
      showToast("Could not reach the server. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-1.5">
      <button
        aria-label="Sign out"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-1.5 py-1.5 text-sm font-semibold text-fg transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 md:gap-3 md:p-2  lg:justify-start"
        disabled={submitting}
        onClick={() => void logout()}
        type="button"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-red-700 md:h-9 md:w-9">
          <LogOut aria-hidden="true" size={17} />
        </span>
        <span className="sidebar-label">Sign out</span>
      </button>
    </div>
  );
}
