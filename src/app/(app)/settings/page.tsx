import { getWorkspaceSettings } from "@/lib/workspace";
import { SettingsForm } from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");
  const settings = await getWorkspaceSettings(user);
  return <SettingsForm initialSettings={settings} ephemeral={!user} />;
}
