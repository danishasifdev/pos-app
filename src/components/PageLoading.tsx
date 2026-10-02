import { LoaderCircle } from "lucide-react";

export function PageLoading({ label = "Loading page" }: { label?: string }) {
  return (
    <main
      aria-busy="true"
      aria-label={label}
      className="flex min-h-0 flex-1 items-center justify-center p-8"
      role="status"
    >
      <div className="flex flex-col items-center gap-3 text-muted-fg">
        <LoaderCircle aria-hidden="true" className="animate-spin text-primary" size={32} />
        <span className="text-sm font-medium">{label}…</span>
      </div>
    </main>
  );
}

export function DashboardLoading({ admin = false }: { admin?: boolean }) {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
      <div className="mb-6 animate-pulse space-y-2">
        <div className="h-3 w-28 rounded bg-surface-muted" />
        <div className="h-8 w-48 rounded bg-surface-muted" />
        <div className="h-4 w-72 max-w-full rounded bg-surface-muted" />
      </div>
      <div className="mb-6 flex gap-2 border-b border-border pb-2">
        {(admin
          ? ["Overview", "Users", "Transactions", "Activity history"]
          : ["Overview", "Trends", "Transactions", "Activity"]
        ).map((tab) => (
          <div
            className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-surface-muted"
            key={tab}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl border border-border bg-surface"
            key={index}
          />
        ))}
      </div>
      <div className="mt-5 h-64 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-fg">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
        Loading {admin ? "admin" : "your"} dashboard…
      </div>
    </main>
  );
}
