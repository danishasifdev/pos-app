import { notFound } from "next/navigation";
import { getReceiptById, getSettings } from "@/lib/db";
import { ReceiptDetail } from "@/components/ReceiptDetail";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = getReceiptById(id);
  const settings = getSettings();

  if (!receipt) notFound();

  return <ReceiptDetail receipt={receipt} settings={settings} />;
}
