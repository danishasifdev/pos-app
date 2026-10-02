import { getCategories, getProducts, getSettings } from "@/lib/db";
import { PosTerminal } from "@/components/PosTerminal";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") redirect(user?.role === "admin" ? "/admin" : "/login");
  const [products, categories, settings] = await Promise.all([
    getProducts(user.id),
    getCategories(user.id),
    getSettings(user.id),
  ]);

  return (
    <PosTerminal
      initialProducts={products}
      categories={categories}
      settings={settings}
    />
  );
}
