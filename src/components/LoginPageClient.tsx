"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountForm } from "@/components/AccountForm";
import { AuthShell } from "@/components/AuthShell";
import { useToast } from "@/components/ToastProvider";

export function LoginPageClient({
  demoMode,
  adminLogin = false,
}: {
  demoMode: boolean;
  adminLogin?: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  async function continueAsDemo() {
    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not open the public demo.");
      }
      showToast("Signed in to the demo account.", "success");
      router.replace("/");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not open the public demo.",
        "error",
      );
    }
  }

  return (
    <AuthShell
      title={adminLogin ? "Administrator sign in" : "Sign in"}
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
        <div className="mt-6 border-t border-border pt-5 text-center">
          <button
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-muted"
            onClick={() => void continueAsDemo()}
            type="button"
          >
            Try the demo workspace
          </button>
          <p className="mt-2 text-xs text-muted-fg">
            No account needed - sample products and receipts.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
