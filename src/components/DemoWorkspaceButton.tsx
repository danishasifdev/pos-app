"use client";

import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

export function DemoWorkspaceButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function continueAsDemo() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not open the public demo.");
      }
      showToast("Signed in to the demo account.", "success");
      router.replace("/");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not open the public demo.",
        "error",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-primary/20 bg-accent-soft/50 p-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles aria-hidden="true" size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-fg">Just looking around?</p>
          <p className="truncate text-[11px] text-muted-fg">
            Sample POS, no signup
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-2 text-xs font-semibold text-fg transition hover:bg-surface-muted"
          href="/"
        >
          Use without login
        </Link>
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
          aria-busy={submitting}
          aria-label={submitting ? "Opening demo workspace" : undefined}
          disabled={submitting}
          onClick={() => void continueAsDemo()}
          type="button"
        >
          {submitting ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={14}
            />
          ) : (
            <>
              Try demo
              <ArrowRight aria-hidden="true" size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
