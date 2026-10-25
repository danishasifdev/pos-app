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
      className={`flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-border/80 bg-surface py-3 md:w-16 md:py-4 ${
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/15 md:h-10 md:w-10">
            <Store aria-hidden="true" size={18} />
          </div>
          <span className="sidebar-label text-sm font-semibold tracking-tight text-fg">
            POS
          </span>
        </Link>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex flex-1 flex-col gap-1 md:gap-1.5"
      >
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={`group flex items-center gap-2 rounded-xl px-1.5 py-1.5 text-sm font-medium transition-all duration-150 md:gap-3 md:p-2 ${align} ${
                active
                  ? "bg-accent-soft/80 text-fg shadow-sm ring-1 ring-border/70"
                  : "text-muted-fg hover:bg-surface-muted hover:text-fg"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all md:h-9 md:w-9 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-muted/80 text-muted-fg group-hover:bg-surface group-hover:text-primary"
                }`}
              >
                <Icon aria-hidden="true" size={17} strokeWidth={2} />
              </span>
              <span className="sidebar-label">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto w-full border-t border-border/80 pt-3">
        <button
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mb-1 hidden w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-muted-fg transition-colors hover:bg-surface-muted hover:text-fg md:flex ${align}`}
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
          className={`mb-2 flex items-center gap-2 rounded-xl px-1.5 py-1.5 md:gap-3 md:px-2.5 md:py-2 ${align}`}
          title={`${user.email} (${user.role})`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary md:h-9 md:w-9">
            <UserRound aria-hidden="true" size={17} />
          </span>
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
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-muted px-1.5 py-1.5 text-sm font-semibold text-fg transition hover:border-primary/30 hover:bg-accent-soft hover:text-primary md:gap-2 md:px-2.5 md:py-2.5 ${align}`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm md:h-8 md:w-8">
              <LogIn aria-hidden="true" size={16} />
            </span>
            <span className="sidebar-label">Log in</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
