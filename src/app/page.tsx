import { getCategories, getProducts, getSettings } from "@/lib/db";
import { PosTerminal } from "@/components/PosTerminal";

export default async function Home() {
  const products = getProducts();
  const categories = getCategories();
  const settings = getSettings();

  return (
    <PosTerminal
      initialProducts={products}
      categories={categories}
      settings={settings}
    />
  );
}
