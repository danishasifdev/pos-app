import Link from "next/link";

export function DashboardUnavailable({ admin = false }: { admin?: boolean }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center p-6">
      <section className="w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h1 className="text-lg font-semibold">
          {admin ? "Admin dashboard is not ready" : "Dashboard is not ready"}
        </h1>
        <p className="mt-2 text-sm">
          The account workspace or activity schema required for dashboards is
          missing. Check the database status below. If the workspace migration
          is already applied, run{" "}
          <code className="rounded bg-amber-100 px-1">0004_account_activity.sql</code>{" "}
          in Supabase SQL Editor, then refresh this page.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link className="underline" href="/api/health" rel="noopener noreferrer" target="_blank">
            Check database status
          </Link>
          <Link className="underline" href={admin ? "/admin" : "/dashboard"}>
            Retry dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
