import { getCategories, getProducts, getSettings } from "@/lib/db";
import { ProductsManager } from "@/components/ProductsManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") redirect(user?.role === "admin" ? "/admin" : "/login");
  const [products, categories, settings] = await Promise.all([
    getProducts(user.id),
    getCategories(user.id),
    getSettings(user.id),
  ]);

  return (
    <ProductsManager
      initialProducts={products}
      categories={categories}
      currencySymbol={settings.currencySymbol}
    />
  );
}
