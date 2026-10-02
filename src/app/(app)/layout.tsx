import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/themes";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = user.role === "admin" ? null : await getSettings(user.id);

  return (
    <ThemeProvider initialTheme={settings?.theme ?? DEFAULT_THEME}>
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">
              {settings?.storeName ?? "Mall POS Admin"}
            </p>
            <p className="truncate text-xs text-muted-fg">
              {settings?.address ?? user.email}
            </p>
          </div>
          {settings && <ThemeSwitcher />}
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
      </div>
    </ThemeProvider>
  );
}