import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = {
  title: "Mall POS",
  description: "Point of sale terminal for retail kiosks and mall stores",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();

  return (
    <html lang="en" data-theme={settings.theme} className="h-full antialiased">
      <body className="flex h-full min-h-screen">
        <ThemeProvider initialTheme={settings.theme}>
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
              <div>
                <h1 className="text-sm font-semibold text-fg">{settings.storeName}</h1>
                <p className="text-xs text-muted-fg">{settings.address}</p>
              </div>
              <ThemeSwitcher />
            </header>
            <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
