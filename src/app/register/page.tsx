import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm } from "@/components/AccountForm";
import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a POS account with its own products, settings, and receipts.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");
  return (
    <AuthShell
      title="Create your account"
      description="Your products, settings, and receipts are kept in your own workspace."
      footer={
        <p>
          Already registered?{" "}
          <Link
            className="font-semibold text-primary hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AccountForm mode="register" />
    </AuthShell>
  );
}
