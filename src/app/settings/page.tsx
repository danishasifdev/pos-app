import { getSettings } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") redirect(user?.role === "admin" ? "/admin" : "/login");
  const settings = await getSettings(user.id);
  return <SettingsForm initialSettings={settings} />;
}
