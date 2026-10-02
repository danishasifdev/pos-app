import Link from "next/link";
import { AccountForm } from "@/components/AccountForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-bg p-6">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Mall POS
        </p>
        <h1 className="mt-2 text-2xl font-bold text-fg">Create your account</h1>
        <p className="mb-7 mt-2 text-sm text-muted-fg">
          Your products, settings, and receipts are kept in your own workspace.
        </p>
        <AccountForm mode="register" />
        <p className="mt-5 text-center text-sm text-muted-fg">
          Already registered?{" "}
          <Link className="font-semibold text-primary underline" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
