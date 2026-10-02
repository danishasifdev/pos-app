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

export type UserRole = "admin" | "user" | "demo";

export type AccountUser = {
  id: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  createdAt: string;
  lastLoginAt: string | null;
};

export type DailySales = {
  day: string;
  total: number;
  transactionCount: number;
};

export type UserDashboardData = {
  salesToday: number;
  salesThisMonth: number;
  transactionCount: number;
  averageTransaction: number;
  voidedCount: number;
  dailySales: DailySales[];
  recentReceipts: Receipt[];
  activity: AccountActivity[];
};

export type AccountActivity = {
  id: string;
  accountId: string;
  accountEmail: string;
  actorEmail: string;
  eventType:
    | "account_created"
    | "signed_in"
    | "account_disabled"
    | "account_reactivated"
    | "account_deleted"
    | "receipt_created"
    | "receipt_voided";
  details: Record<string, unknown>;
  createdAt: string;
};

export type AdminTransaction = Receipt & {
  accountId: string;
  accountEmail: string;
  currencySymbol: string;
};

export type AdminAccountSummary = AccountUser & {
  currencySymbol: string;
  salesTotal: number;
  transactionCount: number;
  voidedCount: number;
  lastTransactionAt: string | null;
  dailySales: DailySales[];
};

export type AdminDashboardData = {
  accounts: AdminAccountSummary[];
  salesByCurrency: { currencySymbol: string; total: number }[];
  transactionCount: number;
  activeAccounts: number;
  dailySales: DailySales[];
  activity: AccountActivity[];
};
