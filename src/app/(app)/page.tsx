import {
  getWorkspaceCategories,
  getWorkspaceProducts,
  getWorkspaceSettings,
} from "@/lib/workspace";
import { PosTerminal } from "@/components/PosTerminal";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resetScratchOnDocumentLoad } from "@/lib/scratch-session";

export default async function Home() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  // Signed-out visitors work against the throwaway scratch workspace, which is
  // wiped on every hard load so nothing survives a refresh.
  await resetScratchOnDocumentLoad(user);

  const [products, categories, settings] = await Promise.all([
    getWorkspaceProducts(user),
    getWorkspaceCategories(user),
    getWorkspaceSettings(user),
  ]);

  return (
    <PosTerminal
      initialProducts={products}
      categories={categories}
      settings={settings}
      signedIn={Boolean(user)}
    />
  );
}