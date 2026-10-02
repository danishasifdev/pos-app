import { LoginPageClient } from "@/components/LoginPageClient";
import { getCurrentUser, isDemoMode, SessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

function destination(user: SessionUser) {
  return user.role === "admin" ? "/admin" : "/";
}

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(destination(user));
  return <LoginPageClient demoMode={isDemoMode()} />;
}
