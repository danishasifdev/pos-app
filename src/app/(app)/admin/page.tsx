import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardUnavailable } from "@/components/DashboardUnavailable";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  // Deliberately no schema pre-flight here. Probing information_schema on
  // Supabase scans every relation in every schema and can take seconds, which
  // on a slow link was enough to push this page past the function timeout and
  // get the stream killed. If the real query fails we fall back to the same
  // "not ready" screen, so the check is not lost, just moved off the hot path.
  let data;
  try {
    data = await getAdminDashboardData();
  } catch (error) {
    console.error("admin dashboard query failed", error);
    return <DashboardUnavailable admin />;
  }

  return <AdminDashboard initialData={data} viewerEmail={user.email} />;
}