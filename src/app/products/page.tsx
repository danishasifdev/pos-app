import { getCategories, getProducts, getSettings } from "@/lib/db";
import { ProductsManager } from "@/components/ProductsManager";

export default async function ProductsPage() {
  const products = getProducts();
  const categories = getCategories();
  const settings = getSettings();

  return (
    <ProductsManager
      initialProducts={products}
      categories={categories}
      currencySymbol={settings.currencySymbol}
    />
  );
}
