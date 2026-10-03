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
        aria-label="Sign out"
        className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-red-100 hover:text-red-800 bg-red-100 disabled:opacity-50 lg:justify-start text-red-700"
        disabled={submitting}
        onClick={() => void logout()}
        type="button"
      >
        <LogOut aria-hidden="true" size={18} />
        <span className="hidden lg:inline">Sign out</span>
      </button>
    </div>
  );
}
