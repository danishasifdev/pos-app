"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("User dashboard failed to load:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center p-6">
      <section className="w-full rounded-xl border border-red-200 bg-red-50 p-6 text-red-950">
        <h1 className="text-lg font-semibold">Your dashboard couldn’t load</h1>
        <p className="mt-2 text-sm">
          Check the database status at <code>/api/health</code>. If dashboard
          activity tables are missing, run migration{" "}
          <code>0004_account_activity.sql</code> in Supabase.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-red-800">Error reference: {error.digest}</p>
        )}
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          onClick={reset}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Try again
        </button>
      </section>
    </main>
  );
}
