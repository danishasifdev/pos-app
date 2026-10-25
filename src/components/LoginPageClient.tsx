"use client";

import Link from "next/link";
import { AccountForm } from "@/components/AccountForm";
import { AuthShell } from "@/components/AuthShell";
import { DemoWorkspaceButton } from "@/components/DemoWorkspaceButton";

export function LoginPageClient({
  demoMode,
  adminLogin = false,
}: {
  demoMode: boolean;
  adminLogin?: boolean;
}) {
  return (
    <AuthShell
      title={adminLogin ? "Administrator sign in" : "Sign in"}
      variant={adminLogin ? "admin" : "login"}
      description={
        adminLogin
          ? "Sign in with the administrator account."
          : "Sign in to access your private POS workspace."
      }
      footer={
        adminLogin ? (
          <Link
            className="font-semibold text-primary hover:underline"
            href="/login"
          >
            Back to user sign in
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p>
              New here?{" "}
              <Link
                className="font-semibold text-primary hover:underline"
                href="/register"
              >
                Create an account
              </Link>
            </p>
            <Link
              className="text-xs text-muted-fg hover:text-fg hover:underline"
              href="/admin/login"
            >
              Admin sign in
            </Link>
          </div>
        )
      }
    >
      <AccountForm
        expectedRole={adminLogin ? "admin" : undefined}
        mode="login"
      />
      {demoMode && !adminLogin && (
        <DemoWorkspaceButton />
      )}
    </AuthShell>
  );
}
