import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

export function GuestWorkspaceLink() {
  return (
    <Link
      className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-primary/25 bg-accent-soft/50 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
      href="/"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserRound aria-hidden="true" size={17} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-fg">
            Continue without an account
          </span>
          <span className="mt-0.5 block text-xs text-muted-fg">
            Temporary workspace · clears when you reload
          </span>
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="shrink-0 text-primary"
        size={17}
      />
    </Link>
  );
}
