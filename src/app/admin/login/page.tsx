import type { Metadata } from "next";
import { LoginPageClient } from "@/components/LoginPageClient";
import { getCurrentUser, isDemoMode } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Administrator sign in",
  description: "Sign in to the Mall POS administrator console.",
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");
  return <LoginPageClient adminLogin demoMode={isDemoMode()} />;
}
