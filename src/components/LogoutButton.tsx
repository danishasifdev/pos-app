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
    <div>
      <button
        className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-fg hover:bg-surface-muted hover:text-fg disabled:opacity-50 md:justify-start"
        disabled={submitting}
        onClick={() => void logout()}
        type="button"
      >
        <LogOut aria-hidden="true" size={18} />
        <span className="hidden md:inline">Sign out</span>
      </button>
    </div>
  );
}
