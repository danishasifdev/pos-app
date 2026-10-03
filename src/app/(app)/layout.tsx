import Link from "next/link";
import { Store } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DemoBanner } from "@/components/DemoBanner";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceSettings } from "@/lib/workspace";
import { DEFAULT_THEME } from "@/lib/themes";

// Reads cookies() via getCurrentUser, so the shell renders per-request.
//
// This layout must never redirect: /admin lives inside this route group, so an
// admin bounce here would redirect /admin to itself in an infinite loop. Each
// page keeps its own guard instead - the terminal and product list are public,
// and pages that need an account (or need to shunt an admin to /admin) redirect
// themselves.
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const anonymous = user === null;

  const settings = await getWorkspaceSettings(user).catch(() => null);

  return (
    <ThemeProvider initialTheme={settings?.theme ?? DEFAULT_THEME}>
      <Sidebar
        user={user ?? { id: "guest", email: "Anonymous", role: "user" }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 md:px-6">
          {anonymous ? (
            <Link
              className="flex min-w-0 items-center gap-2.5"
              href="/"
              prefetch={false}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Store aria-hidden="true" size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight text-fg">
                  {settings?.storeName ?? "POS"}
                </span>
                <span className="block truncate text-xs text-muted-fg">
                  {settings?.address ?? "Demo terminal"}
                </span>
              </span>
            </Link>
          ) : (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {settings?.storeName ?? "POS Admin"}
              </p>
              <p className="truncate text-xs text-muted-fg">
                {settings?.address ?? user.email}
              </p>
            </div>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            {anonymous && (
              <>
                <Link
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-muted sm:hidden"
                  href="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                  href="/register"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </header>
        {anonymous && <DemoBanner />}
        <main className="flex min-h-0 flex-1 flex-col overflow-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
