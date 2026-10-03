import {
  getWorkspaceCategories,
  getWorkspaceProducts,
  getWorkspaceSettings,
} from "@/lib/workspace";
import { ProductsManager } from "@/components/ProductsManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resetScratchOnDocumentLoad } from "@/lib/scratch-session";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  await resetScratchOnDocumentLoad(user);

  const [products, categories, settings] = await Promise.all([
    getWorkspaceProducts(user),
    getWorkspaceCategories(user),
    getWorkspaceSettings(user),
  ]);

  return (
    <ProductsManager
      initialProducts={products}
      categories={categories}
      currencySymbol={settings.currencySymbol}
      ephemeral={!user}
    />
  );
}