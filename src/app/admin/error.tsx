"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard failed to load:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center p-6">
      <section className="w-full rounded-xl border border-red-200 bg-red-50 p-6 text-red-950">
        <h1 className="text-lg font-semibold">Admin dashboard couldn’t load</h1>
        <p className="mt-2 text-sm">
          Check the database schema at <code>/api/health</code>. For account
          history and dashboard data, migration{" "}
          <code>0004_account_activity.sql</code> must be applied.
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
