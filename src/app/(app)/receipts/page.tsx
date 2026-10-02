import { getReceipts, getSettings } from "@/lib/db";
import { ReceiptsList } from "@/components/ReceiptsList";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReceiptsPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") redirect(user?.role === "admin" ? "/admin" : "/login");
  const [receipts, settings] = await Promise.all([
    getReceipts(user.id),
    getSettings(user.id),
  ]);

  return <ReceiptsList receipts={receipts} currencySymbol={settings.currencySymbol} />;
}
