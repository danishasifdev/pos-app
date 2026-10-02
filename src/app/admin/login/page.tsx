import { LoginPageClient } from "@/components/LoginPageClient";
import { getCurrentUser, isDemoMode } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");
  return <LoginPageClient adminLogin demoMode={isDemoMode()} />;
}
