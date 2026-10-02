import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/themes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mall POS",
    template: "%s · Mall POS",
  },
  description: "Point of sale terminal for retail kiosks and mall stores",
  applicationName: "Mall POS",
  openGraph: {
    type: "website",
    siteName: "Mall POS",
    title: "Mall POS",
    description: "Point of sale terminal for retail kiosks and mall stores",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getCurrentUser is wrapped in cache(), so the authenticated shell layout
  // and the page below it reuse this call instead of re-querying.
  const user = await getCurrentUser();
  const settings =
    user && user.role !== "admin" ? await getSettings(user.id) : null;

  return (
    <html lang="en" data-theme={settings?.theme ?? DEFAULT_THEME} className="h-full antialiased">
      <body className="flex h-full min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}