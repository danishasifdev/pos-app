"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountForm } from "@/components/AccountForm";
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
    <main className="flex min-h-full flex-1 items-center justify-center bg-bg p-6">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm text-center font-semibold uppercase tracking-widest text-primary">
          Mall POS
        </p>
        <h1 className="mt-2 text-2xl font-bold text-fg">
          {adminLogin ? "Administrator sign in" : "Sign in"}
        </h1>
        <p className="mb-7 mt-2 text-sm text-muted-fg">
          {adminLogin
            ? "Sign in with the administrator account."
            : "Sign in to access your private POS workspace."}
        </p>
        <AccountForm
          expectedRole={adminLogin ? "admin" : undefined}
          mode="login"
        />
        {demoMode && !adminLogin && (
          <div className="mt-5 border-t border-border pt-5 text-center">
            <p className="mb-3 text-xs text-muted-fg">
              Explore the sample workspace without creating an account.
            </p>
            <button
              className="inline-flex rounded-full border border-border bg-accent-soft px-4 py-2 text-sm font-semibold text-fg hover:opacity-80"
              onClick={() => void continueAsDemo()}
              type="button"
            >
              Continue with demo account to log in
            </button>
          </div>
        )}
        <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
          {adminLogin ? (
            <Link
              className="font-semibold text-primary underline"
              href="/login"
            >
              Back to user sign in
            </Link>
          ) : (
            <>
              <p className="text-muted-fg">
                New here?{" "}
                <Link
                  className="font-semibold text-primary underline"
                  href="/register"
                >
                  Create an account
                </Link>
              </p>
              <Link
                className="font-semibold text-primary underline"
                href="/admin/login"
              >
                Admin login
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
