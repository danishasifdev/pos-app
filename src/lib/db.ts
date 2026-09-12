import fs from "fs";
import path from "path";
import { Category, Product, Receipt, StoreSettings } from "./types";
import { seedCategories, seedProducts, seedSettings } from "./seed";

// ---------------------------------------------------------------------------
// This is a tiny, dependency-free "database" that stores everything as JSON
// files inside the /data folder at the project root. It behaves like a real
// data layer (typed read/write helpers, atomic writes, auto-seeding) but
// needs no external database server, no native modules, and no network
// access - it works the moment you run `npm run dev`.
//
// See SETUP.md at the project root for how this works and how to swap it
// for Postgres/MySQL/SQLite later without changing the rest of the app.
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readFile<T>(name: string, fallback: T): T {
  ensureDataDir();
  const file = filePath(name);
  if (!fs.existsSync(file)) {
    writeFile(name, fallback);
    return fallback;
  }
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeFile<T>(name: string, data: T) {
  ensureDataDir();
  const file = filePath(name);
  const tmp = `${file}.tmp`;
  // Write-then-rename keeps a write from ever leaving a half-written,
  // corrupted JSON file behind if the process is interrupted mid-save.
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, file);
}

// ----- Categories -----------------------------------------------------

export function getCategories(): Category[] {
  return readFile<Category[]>("categories", seedCategories);
}

export function saveCategories(categories: Category[]) {
  writeFile("categories", categories);
}

// ----- Products ---------------------------------------------------------

export function getProducts(): Product[] {
  return readFile<Product[]>("products", seedProducts);
}

export function saveProducts(products: Product[]) {
  writeFile("products", products);
}

export function addProduct(product: Product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
  return product;
}

export function updateProduct(id: string, patch: Partial<Product>) {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...patch };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string) {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

// ----- Settings -----------------------------------------------------------

export function getSettings(): StoreSettings {
  return readFile<StoreSettings>("settings", seedSettings);
}

export function saveSettings(settings: StoreSettings) {
  writeFile("settings", settings);
}

// ----- Receipts -----------------------------------------------------------

export function getReceipts(): Receipt[] {
  return readFile<Receipt[]>("receipts", []);
}

export function getReceiptById(id: string): Receipt | undefined {
  return getReceipts().find((r) => r.id === id);
}

export function addReceipt(receipt: Receipt) {
  const receipts = getReceipts();
  receipts.unshift(receipt); // newest first
  writeFile("receipts", receipts);

  // advance the running receipt-number counter
  const settings = getSettings();
  saveSettings({ ...settings, nextReceiptNumber: settings.nextReceiptNumber + 1 });

  return receipt;
}

export function voidReceipt(id: string) {
  const receipts = getReceipts();
  const idx = receipts.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  receipts[idx] = { ...receipts[idx], voided: true };
  writeFile("receipts", receipts);
  return receipts[idx];
}

export function nextReceiptNumber(): string {
  const settings = getSettings();
  return String(settings.nextReceiptNumber).padStart(6, "0");
}
