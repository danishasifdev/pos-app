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
} from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

const POS_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Terminal", icon: ShoppingCart },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/products", label: "Products", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV = [{ href: "/admin", label: "Dashboard", icon: ShieldCheck }];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const nav = user.role === "admin" ? ADMIN_NAV : POS_NAV;

  return (
    <aside className="flex h-full w-16 flex-col items-center gap-1 border-r border-border bg-surface py-4 md:w-56 md:items-stretch md:px-3">
      <div className="mb-4 flex items-center gap-2 px-2 md:px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Store size={18} />
        </div>
        <span className="hidden text-sm font-semibold text-fg md:inline">Mall POS</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium md:justify-start ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-fg hover:bg-surface-muted hover:text-fg"
              }`}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-3">
        <div
          className="flex items-center justify-center gap-3 px-3 py-2 md:justify-start"
          title={`${user.email} (${user.role})`}
        >
          <UserRound aria-hidden="true" className="shrink-0 text-primary" size={18} />
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-xs font-semibold text-fg">{user.email}</p>
            <p className="text-xs capitalize text-muted-fg">{user.role} account</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
