import { Category, Product, StoreSettings } from "./types";

export const seedCategories: Category[] = [
  { id: "cat-drinks", name: "Drinks", color: "#3b82f6", sortOrder: 0 },
  { id: "cat-bakery", name: "Bakery", color: "#f59e0b", sortOrder: 1 },
  { id: "cat-snacks", name: "Snacks", color: "#10b981", sortOrder: 2 },
  { id: "cat-meals", name: "Meals", color: "#ef4444", sortOrder: 3 },
  { id: "cat-merch", name: "Merch", color: "#8b5cf6", sortOrder: 4 },
];

export const seedProducts: Product[] = [
  { id: "p-1", name: "Iced Latte", price: 4.5, categoryId: "cat-drinks", emoji: "🧋", sku: "DR-001", taxable: true, active: true },
  { id: "p-2", name: "Cold Brew", price: 4.0, categoryId: "cat-drinks", emoji: "🥤", sku: "DR-002", taxable: true, active: true },
  { id: "p-3", name: "Orange Juice", price: 3.5, categoryId: "cat-drinks", emoji: "🧃", sku: "DR-003", taxable: true, active: true },
  { id: "p-4", name: "Bottled Water", price: 1.5, categoryId: "cat-drinks", emoji: "💧", sku: "DR-004", taxable: false, active: true },
  { id: "p-5", name: "Croissant", price: 3.25, categoryId: "cat-bakery", emoji: "🥐", sku: "BK-001", taxable: true, active: true },
  { id: "p-6", name: "Muffin", price: 2.75, categoryId: "cat-bakery", emoji: "🧁", sku: "BK-002", taxable: true, active: true },
  { id: "p-7", name: "Bagel", price: 2.5, categoryId: "cat-bakery", emoji: "🥯", sku: "BK-003", taxable: true, active: true },
  { id: "p-8", name: "Pretzel", price: 2.25, categoryId: "cat-snacks", emoji: "🥨", sku: "SN-001", taxable: true, active: true },
  { id: "p-9", name: "Chips", price: 2.0, categoryId: "cat-snacks", emoji: "🍟", sku: "SN-002", taxable: true, active: true },
  { id: "p-10", name: "Popcorn", price: 3.0, categoryId: "cat-snacks", emoji: "🍿", sku: "SN-003", taxable: true, active: true },
  { id: "p-11", name: "Sandwich", price: 6.5, categoryId: "cat-meals", emoji: "🥪", sku: "ML-001", taxable: true, active: true },
  { id: "p-12", name: "Burger", price: 7.75, categoryId: "cat-meals", emoji: "🍔", sku: "ML-002", taxable: true, active: true },
  { id: "p-13", name: "Salad Bowl", price: 6.0, categoryId: "cat-meals", emoji: "🥗", sku: "ML-003", taxable: true, active: true },
  { id: "p-14", name: "Pizza Slice", price: 4.25, categoryId: "cat-meals", emoji: "🍕", sku: "ML-004", taxable: true, active: true },
  { id: "p-15", name: "Tote Bag", price: 9.0, categoryId: "cat-merch", emoji: "👜", sku: "MC-001", taxable: true, active: true },
  { id: "p-16", name: "Mug", price: 8.0, categoryId: "cat-merch", emoji: "☕", sku: "MC-002", taxable: true, active: true },
];

export const seedSettings: StoreSettings = {
  storeName: "Skyline Mall Kiosk",
  address: "2nd Floor, Skyline Shopping Mall",
  phone: "+1 (555) 010-2030",
  taxRate: 8.5,
  currencySymbol: "$",
  receiptFooter: "Thank you for shopping with us!",
  theme: "slate",
  nextReceiptNumber: 1,
};
