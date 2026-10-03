import { UserDashboard } from "@/components/UserDashboard";
import { getCurrentUser } from "@/lib/auth";
import {
  getWorkspaceDashboard,
  getWorkspaceSettings,
} from "@/lib/workspace";
import { redirect } from "next/navigation";
import { resetScratchOnDocumentLoad } from "@/lib/scratch-session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  await resetScratchOnDocumentLoad(user);

  // Signed-out visitors get their scratch workspace's own numbers, so the
  // dashboard is never blocked on having an account.
  const [data, settings] = await Promise.all([
    getWorkspaceDashboard(user),
    getWorkspaceSettings(user),
  ]);
  return (
    <UserDashboard
      data={data}
      currencySymbol={settings.currencySymbol}
      ephemeral={!user}
    />
  );
}
