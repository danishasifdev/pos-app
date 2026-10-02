import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { getSettings } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mall POS",
  description: "Point of sale terminal for retail kiosks and mall stores",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <html lang="en" className="h-full antialiased">
        <body className="flex h-full min-h-screen">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    );
  }
  const settings =
    user.role === "admin"
      ? null
      : await getSettings(user.id);

  return (
    <html lang="en" data-theme={settings?.theme ?? "slate"} className="h-full antialiased">
      <body className="flex h-full min-h-screen">
        <ToastProvider>
          <ThemeProvider initialTheme={settings?.theme ?? "slate"}>
            <Sidebar user={user} />
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
                <div>
                  <h1 className="text-sm font-semibold text-fg">
                    {settings?.storeName ?? "Mall POS Admin"}
                  </h1>
                  <p className="text-xs text-muted-fg">
                    {settings?.address ?? user.email}
                  </p>
                </div>
                {settings && <ThemeSwitcher />}
              </header>
              <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
            </div>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
