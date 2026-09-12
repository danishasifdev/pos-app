export type Category = {
  id: string;
  name: string;
  color: string; // tailwind-friendly hex used for the category chip
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  price: number; // stored in the store's base currency unit (e.g. dollars)
  categoryId: string;
  emoji: string; // simple visual identifier instead of image uploads
  sku: string;
  taxable: boolean;
  active: boolean;
};

export type ReceiptItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export const MAX_SAVED_RECORDS = 50;

export type Receipt = {
  id: string;
  number: string; // human friendly sequential number e.g. 000123
  createdAt: string; // ISO date
  items: ReceiptItem[];
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "mobile";
  amountTendered: number;
  changeDue: number;
  cashier: string;
  note?: string;
  voided?: boolean;
};

export type ThemeName =
  | "slate"
  | "emerald"
  | "indigo"
  | "rose"
  | "amber"
  | "midnight";

export type StoreSettings = {
  storeName: string;
  address: string;
  phone: string;
  taxRate: number; // percentage, e.g. 8.5
  currencySymbol: string;
  receiptFooter: string;
  theme: ThemeName;
  nextReceiptNumber: number;
};
