import { getReceipts, getSettings } from "@/lib/db";
import { ReceiptsList } from "@/components/ReceiptsList";

export default async function ReceiptsPage() {
  const receipts = getReceipts();
  const settings = getSettings();

  return <ReceiptsList receipts={receipts} currencySymbol={settings.currencySymbol} />;
}
