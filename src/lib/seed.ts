import { Category, Product, StoreSettings } from "./types";

export const demoCategoryDefinitions = [
  { key: "drinks", name: "Drinks", color: "#3b82f6" },
  { key: "bakery", name: "Bakery", color: "#f59e0b" },
  { key: "snacks", name: "Snacks", color: "#10b981" },
  { key: "meals", name: "Meals", color: "#ef4444" },
  { key: "merch", name: "Merch", color: "#8b5cf6" },
] as const;

export const demoProductDefinitions: Array<
  Omit<Product, "id" | "categoryId"> & {
    categoryKey: (typeof demoCategoryDefinitions)[number]["key"];
  }
> = [
  { name: "Iced Latte", price: 4.5, categoryKey: "drinks", emoji: "🧋", sku: "DR-001", taxable: true, active: true },
  { name: "Cold Brew", price: 4, categoryKey: "drinks", emoji: "🥤", sku: "DR-002", taxable: true, active: true },
  { name: "Orange Juice", price: 3.5, categoryKey: "drinks", emoji: "🧃", sku: "DR-003", taxable: true, active: true },
  { name: "Bottled Water", price: 1.5, categoryKey: "drinks", emoji: "💧", sku: "DR-004", taxable: false, active: true },
  { name: "Croissant", price: 3.25, categoryKey: "bakery", emoji: "🥐", sku: "BK-001", taxable: true, active: true },
  { name: "Muffin", price: 2.75, categoryKey: "bakery", emoji: "🧁", sku: "BK-002", taxable: true, active: true },
  { name: "Bagel", price: 2.5, categoryKey: "bakery", emoji: "🥯", sku: "BK-003", taxable: true, active: true },
  { name: "Pretzel", price: 2.25, categoryKey: "snacks", emoji: "🥨", sku: "SN-001", taxable: true, active: true },
  { name: "Chips", price: 2, categoryKey: "snacks", emoji: "🍟", sku: "SN-002", taxable: true, active: true },
  { name: "Popcorn", price: 3, categoryKey: "snacks", emoji: "🍿", sku: "SN-003", taxable: true, active: true },
  { name: "Sandwich", price: 6.5, categoryKey: "meals", emoji: "🥪", sku: "ML-001", taxable: true, active: true },
  { name: "Burger", price: 7.75, categoryKey: "meals", emoji: "🍔", sku: "ML-002", taxable: true, active: true },
  { name: "Salad Bowl", price: 6, categoryKey: "meals", emoji: "🥗", sku: "ML-003", taxable: true, active: true },
  { name: "Pizza Slice", price: 4.25, categoryKey: "meals", emoji: "🍕", sku: "ML-004", taxable: true, active: true },
  { name: "Tote Bag", price: 9, categoryKey: "merch", emoji: "👜", sku: "MC-001", taxable: true, active: true },
  { name: "Mug", price: 8, categoryKey: "merch", emoji: "☕", sku: "MC-002", taxable: true, active: true },
];

export const demoSettings: StoreSettings = {
  storeName: "Skyline Mall Kiosk",
  address: "2nd Floor, Skyline Shopping Mall",
  phone: "+1 (555) 010-2030",
  taxRate: 8.5,
  currencySymbol: "$",
  receiptFooter: "Thank you for shopping with us!",
  theme: "slate",
  nextReceiptNumber: 1,
};

export type SeededCategory = Category & { key: string };
