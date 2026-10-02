"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export function AccountForm({
  mode,
  expectedRole,
}: {
  mode: "login" | "register";
  expectedRole?: "admin";
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, expectedRole }),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        showToast(result.error ?? "Unable to continue.", "error");
        return;
      }
      showToast(
        mode === "login" ? "Signed in successfully." : "Your account is ready.",
        "success",
      );
      router.replace(expectedRole === "admin" ? "/admin" : "/");
      router.refresh();
    } catch {
      showToast("Could not reach the server. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block text-sm font-medium text-fg">
        Email
        <input
          autoComplete="email"
          className="mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-fg outline-none focus:border-primary"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="block text-sm font-medium text-fg">
        Password
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-fg outline-none focus:border-primary"
          minLength={mode === "register" ? 12 : undefined}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {mode === "register" && (
        <p className="text-xs text-muted-fg">
          Use at least 12 characters. Your account includes a private sample POS.
        </p>
      )}
      <button
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting && (
          <LoaderCircle aria-hidden="true" className="mr-2 inline animate-spin" size={16} />
        )}
        {submitting ? "Please wait…" : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}
