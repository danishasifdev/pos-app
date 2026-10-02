import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardUnavailable } from "@/components/DashboardUnavailable";
import { getCurrentUser } from "@/lib/auth";
import { checkDatabaseConnection, getAdminDashboardData } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");
  if (!(await checkDatabaseConnection())) {
    return <DashboardUnavailable admin />;
  }
  const data = await getAdminDashboardData();
  return <AdminDashboard initialData={data} viewerEmail={user.email} />;
}
