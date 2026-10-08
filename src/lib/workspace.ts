import {
  addProduct,
  addReceipt,
  deleteProduct,
  getCategories,
  getProducts,
  getReceiptById,
  getReceipts,
  getSettings,
  getUserDashboardData,
  saveSettings,
  updateProduct,
  voidReceipt,
} from "./db";
import {
  EphemeralState,
  readEphemeral,
  resetEphemeral,
  updateEphemeral,
} from "./ephemeral";
import type { SessionUser } from "./auth";
import { round2 } from "./format";
import type {
  Category,
  DailySales,
  Product,
  Receipt,
  StoreSettings,
  UserDashboardData,
} from "./types";

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
  // An administrator has no workspace of their own, so there is nothing to
  // read. Returning null-shaped data avoids a pointless query that also throws.
  if (actor?.role === "admin") {
    return {
      storeName: "",
      address: "",
      phone: "",
      taxRate: 0,
      currencySymbol: "$",
      receiptFooter: "",
      theme: "slate" as const,
      nextReceiptNumber: 1,
    };
  }
  return actor ? getSettings(actor.id) : (await readEphemeral()).settings;
}

export async function getWorkspaceReceipts(actor: Actor): Promise<Receipt[]> {
  return actor ? getReceipts(actor.id) : (await readEphemeral()).receipts;
}

export async function getWorkspaceReceipt(
  actor: Actor,
  id: string,
): Promise<Receipt | null> {
  if (actor) return (await getReceiptById(actor.id, id)) ?? null;
  const match = (await readEphemeral()).receipts.find(
    (receipt) => receipt.id === id,
  );
  return match ?? null;
}

const DAY_MS = 86_400_000;

function startOfDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Mirrors the Postgres dashboard aggregate for the throwaway workspace, so a
 *  signed-out visitor sees the same shape of data their own sales produce. */
function scratchDashboardData(state: EphemeralState): UserDashboardData {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

  const live = state.receipts.filter((receipt) => !receipt.voided);
  const sold = live.filter(
    (receipt) => new Date(receipt.createdAt).getTime() >= todayStart,
  );
  const month = live.filter(
    (receipt) => new Date(receipt.createdAt).getTime() >= monthStart,
  );

  const dailySales: DailySales[] = [];
  for (let offset = 13; offset >= 0; offset--) {
    const dayStart = todayStart - offset * DAY_MS;
    const nextDay = dayStart + DAY_MS;
    const dayReceipts = live.filter((receipt) => {
      const at = new Date(receipt.createdAt).getTime();
      return at >= dayStart && at < nextDay;
    });
    dailySales.push({
      day: new Date(dayStart).toISOString().slice(0, 10),
      total: round2(dayReceipts.reduce((sum, r) => sum + r.total, 0)),
      transactionCount: dayReceipts.length,
    });
  }

  return {
    salesToday: round2(sold.reduce((sum, r) => sum + r.total, 0)),
    salesThisMonth: round2(month.reduce((sum, r) => sum + r.total, 0)),
    transactionCount: live.length,
    averageTransaction: live.length
      ? round2(live.reduce((sum, r) => sum + r.total, 0) / live.length)
      : 0,
    voidedCount: state.receipts.length - live.length,
    dailySales,
    recentReceipts: [...state.receipts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50),
    activity: [],
  };
}

export async function getWorkspaceDashboard(
  actor: Actor,
): Promise<UserDashboardData> {
  if (actor) return getUserDashboardData(actor.id);
  return scratchDashboardData(await readEphemeral());
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

export async function voidWorkspaceReceipt(
  actor: Actor,
  id: string,
): Promise<Receipt | null> {
  if (actor) return voidReceipt(actor.id, id);
  return updateEphemeral((state) => {
    const current = state.receipts.find((receipt) => receipt.id === id);
    if (!current) return null;
    const voided: Receipt = { ...current, voided: true };
    state.receipts = state.receipts.map((receipt) =>
      receipt.id === id ? voided : receipt,
    );
    return voided;
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