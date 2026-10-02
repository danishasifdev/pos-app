import { UserDashboard } from "@/components/UserDashboard";
import { DashboardUnavailable } from "@/components/DashboardUnavailable";
import { getCurrentUser } from "@/lib/auth";
import {
  checkDatabaseConnection,
  getSettings,
  getUserDashboardData,
} from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (!(await checkDatabaseConnection())) {
    return <DashboardUnavailable />;
  }

  const [data, settings] = await Promise.all([
    getUserDashboardData(user.id),
    getSettings(user.id),
  ]);
  return (
    <UserDashboard data={data} currencySymbol={settings.currencySymbol} />
  );
}
