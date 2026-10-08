import { promises as fs } from "node:fs";
import path from "node:path";
import type { Category, Product, Receipt, StoreSettings } from "./types";
import {
  demoCategoryDefinitions,
  demoProductDefinitions,
  demoSettings,
} from "./seed";

/**
 * Scratch workspace for signed-out visitors.
 *
 * Anything written here lives in data/ephemeral.json and is thrown away on the
 * next anonymous page load (see `resetScratchOnDocumentLoad`), so a demo
 * visitor can ring up a real sale without it ever being kept. Signed-in users
 * never touch this file.
 *
 * There is deliberately no in-memory copy. Next.js evaluates page/layout code
 * and route handlers as separate module instances within one process, so a
 * module-level cache ends up duplicated and diverges from disk - a reset would
 * land in one instance while a write used the other's stale copy. The file is
 * small and this store is low-traffic, so it is the single source of truth.
 */
export type EphemeralState = {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  receipts: Receipt[];
};

const FILE = path.join(process.cwd(), "data", "ephemeral.json");

// Serialises read-modify-write inside one module instance so two concurrent
// calls in the same request cannot lose an update.
let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function seed(): EphemeralState {
  const categories: Category[] = demoCategoryDefinitions.map((category, i) => ({
    id: `e-${category.key}`,
    name: category.name,
    color: category.color,
    sortOrder: i,
  }));
  const idByKey = new Map(
    categories.map((category) => [category.id.slice(2), category.id]),
  );
  // Ids are derived from the sku, not random, so that re-seeding is idempotent.
  // With random ids a second tab (or any reload) would hand the browser a
  // product id the server no longer has, and checkout would fail with
  // "No valid items in cart" for a cart that visibly has items.
  const products: Product[] = demoProductDefinitions.map((product) => ({
    id: `e-${product.sku.toLowerCase()}`,
    name: product.name,
    price: product.price,
    categoryId:
      idByKey.get(product.categoryKey) ?? categories[0]?.id ?? "e-uncategorised",
    emoji: product.emoji,
    sku: product.sku,
    taxable: product.taxable,
    active: product.active,
  }));
  return {
    products,
    categories,
    settings: { ...demoSettings, nextReceiptNumber: 1 },
    receipts: [],
  };
}

async function persist(state: EphemeralState): Promise<void> {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    // Write-then-rename so a reader never sees a half-written file.
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    await fs.rename(tmp, FILE);
  } catch {
    // Read-only or unavailable filesystem (serverless bundles): the store then
    // lives only for the length of the request that created it.
  }
}

async function load(): Promise<EphemeralState> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as EphemeralState;
    if (Array.isArray(parsed?.products) && parsed?.settings) return parsed;
  } catch {
    // missing or corrupt file: fall through to a fresh seed
  }
  const fresh = seed();
  await persist(fresh);
  return fresh;
}

export function readEphemeral(): Promise<EphemeralState> {
  return serialise(load);
}

/** Wipes the scratch workspace back to its seeded state. */
export function resetEphemeral(): Promise<EphemeralState> {
  return serialise(async () => {
    const fresh = seed();
    await persist(fresh);
    return fresh;
  });
}

/** Read-modify-write under the lock. Mutate `state` in place. */
export function updateEphemeral<T>(fn: (state: EphemeralState) => T): Promise<T> {
  return serialise(async () => {
    const state = await load();
    const result = fn(state);
    await persist(state);
    return result;
  });
}