import { getSettings } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const settings = getSettings();
  return <SettingsForm initialSettings={settings} />;
}
