import { notFound } from "next/navigation";
import {
  getWorkspaceReceipt,
  getWorkspaceSettings,
} from "@/lib/workspace";
import { ReceiptDetail } from "@/components/ReceiptDetail";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  const [receipt, settings] = await Promise.all([
    getWorkspaceReceipt(user, id),
    getWorkspaceSettings(user),
  ]);

  if (!receipt) notFound();

  return (
    <ReceiptDetail receipt={receipt} settings={settings} ephemeral={!user} />
  );
}
