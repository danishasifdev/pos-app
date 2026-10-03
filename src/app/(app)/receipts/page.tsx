import {
  getWorkspaceReceipts,
  getWorkspaceSettings,
} from "@/lib/workspace";
import { ReceiptsList } from "@/components/ReceiptsList";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resetScratchOnDocumentLoad } from "@/lib/scratch-session";

export default async function ReceiptsPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  await resetScratchOnDocumentLoad(user);

  const [receipts, settings] = await Promise.all([
    getWorkspaceReceipts(user),
    getWorkspaceSettings(user),
  ]);

  return (
    <ReceiptsList
      receipts={receipts}
      currencySymbol={settings.currencySymbol}
      ephemeral={!user}
    />
  );
}
