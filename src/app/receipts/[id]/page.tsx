import { notFound } from "next/navigation";
import { getReceiptById, getSettings } from "@/lib/db";
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
  if (!user || user.role === "admin") redirect(user?.role === "admin" ? "/admin" : "/login");
  const [receipt, settings] = await Promise.all([
    getReceiptById(user.id, id),
    getSettings(user.id),
  ]);

  if (!receipt) notFound();

  return <ReceiptDetail receipt={receipt} settings={settings} />;
}
