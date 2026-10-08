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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

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
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();

  // Below md the sidebar is always the icon rail; `sidebar-label` hides the text
  // there, and [data-collapsed="false"] brings it back from md up. One rule
  // covers nested labels such as LogoutButton's.
  const align = collapsed ? "justify-center" : "md:justify-start";

  return (
    <aside
      className={`flex h-full items-center w-16 shrink-0 flex-col gap-1 border-r border-border bg-surface py-4 ${
        collapsed ? "md:px-0" : "md:w-fit md:px-3 md:items-start"
      }`}
      data-collapsed={collapsed}
    >
      <div className="mb-5 flex items-center gap-2.5 px-2 md:px-1">
        <Link
          href="/"
          aria-label="homepage"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Store aria-hidden="true" size={18} />
          </div>
          <span className="sidebar-label text-sm font-semibold tracking-tight text-fg">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${align} ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-fg hover:bg-surface-muted hover:text-fg"
              }`}
            >
              <Icon aria-hidden="true" size={18} />
              <span className="sidebar-label">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-3">
        <button
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mb-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-fg transition-colors hover:bg-surface-muted hover:text-fg md:flex ${align}`}
          onClick={toggleCollapsed}
          type="button"
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" size={18} />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" size={18} />
              <span className="sidebar-label">Collapse</span>
            </>
          )}
        </button>
        <div
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${align}`}
          title={`${user.email} (${user.role})`}
        >
          <UserRound
            aria-hidden="true"
            className="shrink-0 text-primary"
            size={18}
          />
          <div className="sidebar-label-block min-w-0">
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
            <span className="sidebar-label">Log in</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
