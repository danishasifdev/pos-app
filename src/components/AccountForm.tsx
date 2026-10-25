"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <form className="space-y-5" onSubmit={submit}>
      <label className="block text-sm font-medium text-fg">
        Email address
        <span className="relative mt-2 block">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-fg"
            size={17}
          />
          <input
            autoComplete="email"
            autoCapitalize="none"
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 pl-11 text-sm text-fg shadow-sm outline-none transition placeholder:text-muted-fg/80 hover:border-muted-fg/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@yourbusiness.com"
            required
            spellCheck={false}
            type="email"
            value={email}
          />
        </span>
      </label>
      <label className="block text-sm font-medium text-fg">
        Password
        <span className="relative mt-2 block">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-fg"
            size={17}
          />
          <input
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 pl-11 pr-12 text-sm text-fg shadow-sm outline-none transition placeholder:text-muted-fg/80 hover:border-muted-fg/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
            minLength={mode === "register" ? 12 : undefined}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={
              mode === "register"
                ? "At least 12 characters"
                : "Enter your password"
            }
            required
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-fg hover:text-fg"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={17} />
            ) : (
              <Eye aria-hidden="true" size={17} />
            )}
          </button>
        </span>
      </label>

      <button
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-xl hover:shadow-primary/20 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting && (
          <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
        )}
        {submitting
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
        {!submitting && (
          <ArrowRight
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
            size={17}
          />
        )}
      </button>

      {mode === "register" && (
        <p className="-mt-1 flex items-start gap-2 text-xs leading-5 text-muted-fg">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-primary"
            size={15}
          />
          Your workspace is private. Use at least 12 characters for your
          password.
        </p>
      )}
    </form>
  );
}
