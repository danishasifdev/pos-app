"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Receipt,
  Package,
  Settings,
  Store,
  UserRound,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

const POS_NAV = [
  { href: "/", label: "Terminal", icon: ShoppingCart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/products", label: "Products", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV = [{ href: "/admin", label: "Dashboard", icon: ShieldCheck }];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const nav = user.role === "admin" ? ADMIN_NAV : POS_NAV;

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-4 lg:w-56 lg:items-stretch lg:px-3">
      <div className="mb-5 flex items-center gap-2.5 px-2 md:px-1">
        <Link
          href="/"
          aria-label="homepage"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Store aria-hidden="true" size={18} />
          </div>
          <span className="hidden text-sm font-semibold tracking-tight text-fg lg:inline">
            POS
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-fg hover:bg-surface-muted hover:text-fg"
              }`}
            >
              <Icon aria-hidden="true" size={18} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-3">
        <div
          className="flex items-center justify-center gap-3 rounded-lg px-3 py-2 lg:justify-start"
          title={`${user.email} (${user.role})`}
        >
          <UserRound
            aria-hidden="true"
            className="shrink-0 text-primary"
            size={18}
          />
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-xs font-semibold text-fg">
              {user.email}
            </p>
            <p className="text-xs capitalize text-muted-fg">
              {user.role} account
            </p>
          </div>
        </div>
        {user.id !== "guest" ? (
          <LogoutButton />
        ) : (
          <Link
            href="/login"
            aria-label="Sign out"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 flex items-center justify-center gap-2"
            type="button"
          >
            <LogIn aria-hidden="true" size={16} />
            <span className="hidden lg:inline">Log in</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
