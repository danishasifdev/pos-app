import {
  addProduct,
  addReceipt,
  deleteProduct,
  getCategories,
  getProducts,
  getReceipts,
  getSettings,
  saveSettings,
  updateProduct,
} from "./db";
import { readEphemeral, resetEphemeral, updateEphemeral } from "./ephemeral";
import type { SessionUser } from "./auth";
import type { Category, Product, Receipt, StoreSettings } from "./types";

/**
 * One read/write surface for both kinds of caller:
 *
 *  - a signed-in user  -> their own Postgres workspace
 *  - a signed-out user -> the throwaway JSON scratch workspace
 *
 * Callers pass `user` straight through, so no route needs to branch on auth.
 */
type Actor = SessionUser | null;

export { resetEphemeral };

export function isScratchSession(actor: Actor): boolean {
  return actor === null;
}

export async function getWorkspaceProducts(actor: Actor): Promise<Product[]> {
  return actor ? getProducts(actor.id) : (await readEphemeral()).products;
}

export async function getWorkspaceCategories(
  actor: Actor,
): Promise<Category[]> {
  return actor ? getCategories(actor.id) : (await readEphemeral()).categories;
}

export async function getWorkspaceSettings(
  actor: Actor,
): Promise<StoreSettings> {
  return actor ? getSettings(actor.id) : (await readEphemeral()).settings;
}

export async function getWorkspaceReceipts(actor: Actor): Promise<Receipt[]> {
  return actor ? getReceipts(actor.id) : (await readEphemeral()).receipts;
}

export async function addWorkspaceProduct(
  actor: Actor,
  product: Product,
): Promise<Product> {
  if (actor) return addProduct(actor.id, product);
  await updateEphemeral((state) => {
    state.products = [...state.products, product];
  });
  return product;
}

export async function updateWorkspaceProduct(
  actor: Actor,
  id: string,
  patch: Partial<Product>,
): Promise<Product | null> {
  if (actor) return updateProduct(actor.id, id, patch);
  return updateEphemeral((state) => {
    const current = state.products.find((product) => product.id === id);
    if (!current) return null;
    const merged: Product = { ...current, ...patch, id: current.id };
    state.products = state.products.map((product) =>
      product.id === id ? merged : product,
    );
    return merged;
  });
}

export async function deleteWorkspaceProduct(
  actor: Actor,
  id: string,
): Promise<void> {
  if (actor) return deleteProduct(actor.id, id);
  await updateEphemeral((state) => {
    state.products = state.products.filter((product) => product.id !== id);
  });
}

export async function saveWorkspaceSettings(
  actor: Actor,
  settings: StoreSettings,
): Promise<void> {
  if (actor) return saveSettings(actor.id, settings);
  await updateEphemeral((state) => {
    state.settings = settings;
  });
}

export async function addWorkspaceReceipt(
  actor: Actor,
  receipt: Omit<Receipt, "number">,
): Promise<Receipt> {
  if (actor) return addReceipt(actor.id, receipt);
  return updateEphemeral((state) => {
    const saved: Receipt = {
      ...receipt,
      number: String(state.settings.nextReceiptNumber).padStart(6, "0"),
    };
    state.receipts = [...state.receipts, saved];
    state.settings.nextReceiptNumber += 1;
    return saved;
  });
}