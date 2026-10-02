import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { demoCategoryDefinitions, demoProductDefinitions, demoSettings } from "./seed";
import {
  AccountUser,
  AccountActivity,
  AdminAccountSummary,
  AdminDashboardData,
  AdminTransaction,
  Category,
  DailySales,
  Product,
  Receipt,
  StoreSettings,
  UserDashboardData,
  UserRole,
} from "./types";

const MAX_REGULAR_ACCOUNTS = 25;
const INACTIVE_DAYS = 90;
let client: ReturnType<typeof postgres> | undefined;

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_")) {
    throw new Error("Configure DATABASE_URL with your Supabase Postgres URI.");
  }
  client ??= postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return client;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  const sql = getClient();
  const [result] = await sql<{ settingsExists: boolean }[]>`
    SELECT (
      to_regclass('public.settings') IS NOT NULL
      AND to_regclass('public.users') IS NOT NULL
      AND to_regclass('public.account_activity') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('categories', 'products', 'settings', 'receipts')
          AND column_name = 'account_id'
        GROUP BY table_schema
        HAVING COUNT(DISTINCT table_name) = 4
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'account_activity'
      )
    ) AS "settingsExists"
  `;
  return result.settingsExists;
}

type UserRow = {
  id: string;
  email: string;
  passwordHash: string | null;
  role: UserRole;
  status: "active" | "disabled";
  createdAt: Date;
  lastLoginAt: Date | null;
};

function accountUser(row: UserRow): AccountUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  };
}

export async function createAccount(
  email: string,
  passwordHash: string,
): Promise<AccountUser> {
  const sql = getClient();
  const id = randomUUID();
  try {
    return await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(734001)`;
      const [count] = await tx<{ total: number }[]>`
        SELECT COUNT(*)::int AS total FROM users WHERE role = 'user'
      `;
      if (count.total >= MAX_REGULAR_ACCOUNTS) {
        throw new Error("ACCOUNT_LIMIT_REACHED");
      }
      const [row] = await tx<UserRow[]>`
        INSERT INTO users (id, email, password_hash, role, status, last_login_at)
        VALUES (${id}, ${email}, ${passwordHash}, 'user', 'active', NOW())
        RETURNING
          id, email, password_hash AS "passwordHash", role, status,
          created_at AS "createdAt", last_login_at AS "lastLoginAt"
      `;

      const categoryIds = new Map<string, string>();
      for (const [index, category] of demoCategoryDefinitions.entries()) {
        const categoryId = `${id}-${category.key}`;
        categoryIds.set(category.key, categoryId);
        await tx`
          INSERT INTO categories (id, account_id, name, color, sort_order)
          VALUES (${categoryId}, ${id}, ${category.name}, ${category.color}, ${index})
        `;
      }
      for (const product of demoProductDefinitions) {
        await tx`
          INSERT INTO products (
            id, account_id, name, price, category_id, emoji, sku, taxable, active
          )
          VALUES (
            ${`p-${randomUUID()}`}, ${id}, ${product.name}, ${product.price},
            ${categoryIds.get(product.categoryKey)!}, ${product.emoji}, ${product.sku},
            ${product.taxable}, ${product.active}
          )
        `;
      }
      await tx`
        INSERT INTO settings (
          id, account_id, store_name, address, phone, tax_rate, currency_symbol,
          receipt_footer, theme, next_receipt_number
        )
        VALUES (
          1, ${id}, ${demoSettings.storeName}, ${demoSettings.address}, ${demoSettings.phone},
          ${demoSettings.taxRate}, ${demoSettings.currencySymbol}, ${demoSettings.receiptFooter},
          ${demoSettings.theme}, 1
        )
      `;
      await tx`
        INSERT INTO account_activity (
          account_id, account_email, actor_id, actor_email, event_type
        )
        VALUES (${id}, ${email}, ${id}, ${email}, 'account_created')
      `;
      return accountUser(row);
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "ACCOUNT_LIMIT_REACHED" ||
        (error as Error & { code?: string }).code === "23505")
    ) {
      throw error;
    }
    throw error;
  }
}

export async function isAccountSessionActive(
  id: string,
  role: UserRole,
): Promise<boolean> {
  if (role === "demo") return id === "demo";
  const sql = getClient();
  return sql.begin(async (tx) => {
    const [row] = await tx<{ email: string; active: boolean }[]>`
      UPDATE users
      SET
        status = CASE
          WHEN role = 'user'
            AND (
              last_login_at IS NULL
              OR last_login_at < NOW() - (${INACTIVE_DAYS} * INTERVAL '1 day')
            )
          THEN 'disabled'
          ELSE status
        END,
        last_login_at = CASE
          WHEN role = 'user'
            AND (
              last_login_at IS NULL
              OR last_login_at < NOW() - INTERVAL '1 day'
            )
          THEN NOW()
          ELSE last_login_at
        END
      WHERE id = ${id}
        AND status = 'active'
        AND role = ${role}
      RETURNING email, status = 'active' AS active
    `;
    if (row && !row.active) {
      await tx`
        INSERT INTO account_activity (
          account_id, account_email, actor_id, actor_email, event_type
        )
        VALUES (${id}, ${row.email}, 'system', 'System', 'account_disabled')
      `;
    }
    return row?.active ?? false;
  });
}

export type LoginRecord = {
  user: AccountUser;
  passwordHash: string;
};

export async function getLoginRecord(email: string): Promise<LoginRecord | null> {
  const sql = getClient();
  const [row] = await sql<UserRow[]>`
    SELECT
      id, email, password_hash AS "passwordHash", role, status,
      created_at AS "createdAt", last_login_at AS "lastLoginAt"
    FROM users
    WHERE LOWER(email) = ${email}
      AND role IN ('admin', 'user')
  `;
  if (!row?.passwordHash) return null;
  const inactive =
    row.role === "user" &&
    (!row.lastLoginAt ||
      row.lastLoginAt.getTime() < Date.now() - INACTIVE_DAYS * 86_400_000);
  return {
    user: accountUser({
      ...row,
      status: inactive ? "disabled" : row.status,
    }),
    passwordHash: row.passwordHash,
  };
}

export async function recordSuccessfulLogin(id: string): Promise<void> {
  const sql = getClient();
  await sql.begin(async (tx) => {
    const [user] = await tx<{ email: string }[]>`
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ${id} AND status = 'active' AND role IN ('admin', 'user')
      RETURNING email
    `;
    if (user) {
      await tx`
        INSERT INTO account_activity (
          account_id, account_email, actor_id, actor_email, event_type
        )
        VALUES (${id}, ${user.email}, ${id}, ${user.email}, 'signed_in')
      `;
    }
  });
}

export async function listAccounts(): Promise<AccountUser[]> {
  const sql = getClient();
  const rows = await sql<UserRow[]>`
    SELECT
      id, email, password_hash AS "passwordHash", role, status,
      created_at AS "createdAt", last_login_at AS "lastLoginAt"
    FROM users
    ORDER BY
      CASE role WHEN 'admin' THEN 0 WHEN 'demo' THEN 1 ELSE 2 END,
      created_at
  `;
  await expireInactiveAccounts();
  return rows.map((row) =>
    row.role === "user" &&
    row.status === "active" &&
    row.lastLoginAt &&
    row.lastLoginAt.getTime() < Date.now() - INACTIVE_DAYS * 86_400_000
      ? { ...accountUser(row), status: "disabled" }
      : accountUser(row),
  );
}

export async function expireInactiveAccounts(): Promise<number> {
  const sql = getClient();
  return sql.begin(async (tx) => {
    const rows = await tx<{ id: string; email: string }[]>`
      UPDATE users
      SET status = 'disabled'
      WHERE role = 'user'
        AND status = 'active'
        AND last_login_at < NOW() - (${INACTIVE_DAYS} * INTERVAL '1 day')
      RETURNING id, email
    `;
    for (const account of rows) {
      await tx`
        INSERT INTO account_activity (
          account_id, account_email, actor_id, actor_email, event_type
        )
        VALUES (
          ${account.id}, ${account.email}, 'system', 'System', 'account_disabled'
        )
      `;
    }
    return rows.length;
  });
}

export async function setAccountStatus(
  id: string,
  status: "active" | "disabled",
  actor: { id: string; email: string },
): Promise<AccountUser | null> {
  const sql = getClient();
  return sql.begin(async (tx) => {
    const [row] = await tx<UserRow[]>`
      UPDATE users
      SET
        status = ${status},
        last_login_at = CASE WHEN ${status} = 'active' THEN NOW() ELSE last_login_at END
      WHERE id = ${id} AND role = 'user'
      RETURNING
        id, email, password_hash AS "passwordHash", role, status,
        created_at AS "createdAt", last_login_at AS "lastLoginAt"
    `;
    if (!row) return null;
    await tx`
      INSERT INTO account_activity (
        account_id, account_email, actor_id, actor_email, event_type
      )
      VALUES (
        ${row.id}, ${row.email}, ${actor.id}, ${actor.email},
        ${status === "active" ? "account_reactivated" : "account_disabled"}
      )
    `;
    return accountUser(row);
  });
}

export async function deleteAccount(
  id: string,
  actor: { id: string; email: string },
): Promise<boolean> {
  const sql = getClient();
  return sql.begin(async (tx) => {
    const [account] = await tx<{ id: string; email: string }[]>`
      SELECT id, email FROM users WHERE id = ${id} AND role = 'user' FOR UPDATE
    `;
    if (!account) return false;
    await tx`
      INSERT INTO account_activity (
        account_id, account_email, actor_id, actor_email, event_type
      )
      VALUES (${id}, ${account.email}, ${actor.id}, ${actor.email}, 'account_deleted')
    `;
    await tx`DELETE FROM users WHERE id = ${id} AND role = 'user'`;
    return true;
  });
}

type ReceiptRow = Omit<Receipt, "createdAt" | "note" | "items"> & {
  createdAt: Date;
  note: string | null;
  items: Receipt["items"] | string;
};

type AccountActivityRow = Omit<AccountActivity, "createdAt" | "details"> & {
  createdAt: Date;
  details: Record<string, unknown> | string;
};

function accountActivityFromRow(row: AccountActivityRow): AccountActivity {
  const details =
    typeof row.details === "string"
      ? (JSON.parse(row.details) as Record<string, unknown>)
      : row.details;
  return { ...row, details, createdAt: row.createdAt.toISOString() };
}

function receiptFromRow(receipt: ReceiptRow): Receipt {
  const items =
    typeof receipt.items === "string"
      ? (JSON.parse(receipt.items) as Receipt["items"])
      : receipt.items;
  if (!Array.isArray(items)) {
    throw new Error(`Receipt ${receipt.id} has invalid item data.`);
  }
  return {
    ...receipt,
    items,
    createdAt: receipt.createdAt.toISOString(),
    note: receipt.note ?? undefined,
  };
}

export async function getCategories(accountId: string): Promise<Category[]> {
  const sql = getClient();
  return sql<Category[]>`
    SELECT id, name, color, sort_order AS "sortOrder"
    FROM categories
    WHERE account_id = ${accountId}
    ORDER BY sort_order, name
  `;
}

export async function addCategory(
  accountId: string,
  category: Category,
): Promise<Category> {
  const sql = getClient();
  await sql`
    INSERT INTO categories (id, account_id, name, color, sort_order)
    VALUES (${category.id}, ${accountId}, ${category.name}, ${category.color}, ${category.sortOrder})
  `;
  return category;
}

export async function getProducts(accountId: string): Promise<Product[]> {
  const sql = getClient();
  return sql<Product[]>`
    SELECT
      id, name, price, category_id AS "categoryId", emoji, sku, taxable, active
    FROM products
    WHERE account_id = ${accountId}
    ORDER BY name
  `;
}

export async function addProduct(
  accountId: string,
  product: Product,
): Promise<Product> {
  const sql = getClient();
  await sql`
    INSERT INTO products (
      id, account_id, name, price, category_id, emoji, sku, taxable, active
    )
    VALUES (
      ${product.id}, ${accountId}, ${product.name}, ${product.price}, ${product.categoryId},
      ${product.emoji}, ${product.sku}, ${product.taxable}, ${product.active}
    )
  `;
  return product;
}

export async function updateProduct(
  accountId: string,
  id: string,
  patch: Partial<Product>,
): Promise<Product | null> {
  const sql = getClient();
  const [current] = await sql<Product[]>`
    SELECT id, name, price, category_id AS "categoryId", emoji, sku, taxable, active
    FROM products WHERE account_id = ${accountId} AND id = ${id}
  `;
  if (!current) return null;
  const product = { ...current, ...patch, id: current.id };
  const [updated] = await sql<Product[]>`
    UPDATE products SET
      name = ${product.name}, price = ${product.price}, category_id = ${product.categoryId},
      emoji = ${product.emoji}, sku = ${product.sku}, taxable = ${product.taxable},
      active = ${product.active}
    WHERE account_id = ${accountId} AND id = ${id}
    RETURNING id, name, price, category_id AS "categoryId", emoji, sku, taxable, active
  `;
  return updated ?? null;
}

export async function deleteProduct(accountId: string, id: string): Promise<void> {
  const sql = getClient();
  await sql`DELETE FROM products WHERE account_id = ${accountId} AND id = ${id}`;
}

export async function getSettings(accountId: string): Promise<StoreSettings> {
  const sql = getClient();
  const [settings] = await sql<StoreSettings[]>`
    SELECT
      store_name AS "storeName", address, phone, tax_rate AS "taxRate",
      currency_symbol AS "currencySymbol", receipt_footer AS "receiptFooter",
      theme, next_receipt_number AS "nextReceiptNumber"
    FROM settings
    WHERE account_id = ${accountId} AND id = 1
  `;
  if (!settings) {
    throw new Error(`Settings are missing for account ${accountId}.`);
  }
  return settings;
}

export async function saveSettings(
  accountId: string,
  settings: StoreSettings,
): Promise<void> {
  const sql = getClient();
  await sql`
    UPDATE settings SET
      store_name = ${settings.storeName}, address = ${settings.address},
      phone = ${settings.phone}, tax_rate = ${settings.taxRate},
      currency_symbol = ${settings.currencySymbol}, receipt_footer = ${settings.receiptFooter},
      theme = ${settings.theme}, next_receipt_number = ${settings.nextReceiptNumber}
    WHERE account_id = ${accountId} AND id = 1
  `;
}

export async function getReceipts(accountId: string): Promise<Receipt[]> {
  const sql = getClient();
  const rows = await sql<ReceiptRow[]>`
    SELECT
      id, number, created_at AS "createdAt", items, subtotal,
      tax_rate AS "taxRate", tax_total AS "taxTotal", discount, total,
      payment_method AS "paymentMethod", amount_tendered AS "amountTendered",
      change_due AS "changeDue", cashier, note, voided
    FROM receipts
    WHERE account_id = ${accountId}
    ORDER BY created_at DESC
  `;
  return rows.map(receiptFromRow);
}

export async function getReceiptById(
  accountId: string,
  id: string,
): Promise<Receipt | undefined> {
  const sql = getClient();
  const [receipt] = await sql<ReceiptRow[]>`
    SELECT
      id, number, created_at AS "createdAt", items, subtotal,
      tax_rate AS "taxRate", tax_total AS "taxTotal", discount, total,
      payment_method AS "paymentMethod", amount_tendered AS "amountTendered",
      change_due AS "changeDue", cashier, note, voided
    FROM receipts
    WHERE account_id = ${accountId} AND id = ${id}
  `;
  return receipt ? receiptFromRow(receipt) : undefined;
}

export async function addReceipt(
  accountId: string,
  receipt: Omit<Receipt, "number">,
): Promise<Receipt> {
  const sql = getClient();
  return sql.begin(async (transaction) => {
    const [settings] = await transaction<{ next_receipt_number: number }[]>`
      SELECT next_receipt_number
      FROM settings
      WHERE account_id = ${accountId} AND id = 1
      FOR UPDATE
    `;
    if (!settings) throw new Error(`Settings are missing for account ${accountId}.`);

    const savedReceipt: Receipt = {
      ...receipt,
      number: String(settings.next_receipt_number).padStart(6, "0"),
    };
    await transaction`
      INSERT INTO receipts (
        id, account_id, number, created_at, items, subtotal, tax_rate, tax_total,
        discount, total, payment_method, amount_tendered, change_due, cashier, note, voided
      )
      VALUES (
        ${savedReceipt.id}, ${accountId}, ${savedReceipt.number}, ${savedReceipt.createdAt},
        ${sql.json(savedReceipt.items)}, ${savedReceipt.subtotal},
        ${savedReceipt.taxRate}, ${savedReceipt.taxTotal}, ${savedReceipt.discount},
        ${savedReceipt.total}, ${savedReceipt.paymentMethod}, ${savedReceipt.amountTendered},
        ${savedReceipt.changeDue}, ${savedReceipt.cashier}, ${savedReceipt.note ?? null},
        ${savedReceipt.voided ?? false}
      )
    `;
    const [account] = await transaction<{ email: string }[]>`
      SELECT email FROM users WHERE id = ${accountId}
    `;
    if (!account) throw new Error(`Account ${accountId} does not exist.`);
    await transaction`
      INSERT INTO account_activity (
        account_id, account_email, actor_id, actor_email, event_type, details
      )
      VALUES (
        ${accountId}, ${account.email}, ${accountId}, ${account.email},
        'receipt_created',
        ${transaction.json({ receiptId: savedReceipt.id, receiptNumber: savedReceipt.number, total: savedReceipt.total })}
      )
    `;
    await transaction`
      UPDATE settings
      SET next_receipt_number = next_receipt_number + 1
      WHERE account_id = ${accountId} AND id = 1
    `;
    return savedReceipt;
  });
}

export async function voidReceipt(
  accountId: string,
  id: string,
): Promise<Receipt | null> {
  const sql = getClient();
  return sql.begin(async (tx) => {
    const [receipt] = await tx<ReceiptRow[]>`
      UPDATE receipts
      SET voided = true
      WHERE account_id = ${accountId} AND id = ${id} AND voided = false
      RETURNING
        id, number, created_at AS "createdAt", items, subtotal,
        tax_rate AS "taxRate", tax_total AS "taxTotal", discount, total,
        payment_method AS "paymentMethod", amount_tendered AS "amountTendered",
        change_due AS "changeDue", cashier, note, voided
    `;
    if (!receipt) return null;
    const [account] = await tx<{ email: string }[]>`
      SELECT email FROM users WHERE id = ${accountId}
    `;
    if (!account) throw new Error(`Account ${accountId} does not exist.`);
    await tx`
      INSERT INTO account_activity (
        account_id, account_email, actor_id, actor_email, event_type, details
      )
      VALUES (
        ${accountId}, ${account.email}, ${accountId}, ${account.email},
        'receipt_voided',
        ${tx.json({ receiptId: receipt.id, receiptNumber: receipt.number, total: receipt.total })}
      )
    `;
    return receiptFromRow(receipt);
  });
}

export async function getUserDashboardData(
  accountId: string,
): Promise<UserDashboardData> {
  const sql = getClient();
  const [stats, dailySales, recentRows, activityRows] = await Promise.all([
    sql<{
      salesToday: number | null;
      salesThisMonth: number | null;
      transactionCount: number;
      averageTransaction: number | null;
      voidedCount: number;
    }[]>`
      SELECT
        COALESCE(SUM(total) FILTER (
          WHERE NOT voided AND created_at >= date_trunc('day', NOW())
        ), 0)::float8 AS "salesToday",
        COALESCE(SUM(total) FILTER (
          WHERE NOT voided AND created_at >= date_trunc('month', NOW())
        ), 0)::float8 AS "salesThisMonth",
        COUNT(*) FILTER (WHERE NOT voided)::int AS "transactionCount",
        COALESCE(AVG(total) FILTER (WHERE NOT voided), 0)::float8 AS "averageTransaction",
        COUNT(*) FILTER (WHERE voided)::int AS "voidedCount"
      FROM receipts
      WHERE account_id = ${accountId}
    `,
    getDailySales(sql, accountId),
    sql<ReceiptRow[]>`
      SELECT
        id, number, created_at AS "createdAt", items, subtotal,
        tax_rate AS "taxRate", tax_total AS "taxTotal", discount, total,
        payment_method AS "paymentMethod", amount_tendered AS "amountTendered",
        change_due AS "changeDue", cashier, note, voided
      FROM receipts
      WHERE account_id = ${accountId}
      ORDER BY created_at DESC
      LIMIT 50
    `,
    getRecentAccountActivity(sql, accountId),
  ]);
  const [summary] = stats;
  return {
    salesToday: summary?.salesToday ?? 0,
    salesThisMonth: summary?.salesThisMonth ?? 0,
    transactionCount: summary?.transactionCount ?? 0,
    averageTransaction: summary?.averageTransaction ?? 0,
    voidedCount: summary?.voidedCount ?? 0,
    dailySales,
    recentReceipts: recentRows.map(receiptFromRow),
    activity: activityRows,
  };
}

function getDailySales(
  sql: ReturnType<typeof getClient>,
  accountId: string,
) {
  return sql<DailySales[]>`
    WITH days AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '13 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      to_char(days.day, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(receipts.total) FILTER (WHERE NOT receipts.voided), 0)::float8 AS total,
      COUNT(receipts.id) FILTER (WHERE NOT receipts.voided)::int AS "transactionCount"
    FROM days
    LEFT JOIN receipts
      ON receipts.account_id = ${accountId}
      AND receipts.created_at >= days.day
      AND receipts.created_at < days.day + INTERVAL '1 day'
    GROUP BY days.day
    ORDER BY days.day
  `;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const sql = getClient();
  const [
    accounts,
    salesByDay,
    activityRows,
    salesByCurrency,
    accountDailyRows,
    accountMetrics,
  ] =
    await Promise.all([
      listAccounts(),
      getAdminDailySales(sql),
      getRecentAccountActivity(sql),
      sql<{ currencySymbol: string; total: number }[]>`
        SELECT
          settings.currency_symbol AS "currencySymbol",
          COALESCE(SUM(receipts.total) FILTER (WHERE NOT receipts.voided), 0)::float8 AS total
        FROM receipts
        JOIN settings ON settings.account_id = receipts.account_id AND settings.id = 1
        GROUP BY settings.currency_symbol
        ORDER BY settings.currency_symbol
      `,
      getAdminAccountDailySales(sql),
      sql<{
        id: string;
        currencySymbol: string;
        salesTotal: number;
        transactionCount: number;
        voidedCount: number;
        lastTransactionAt: Date | null;
      }[]>`
        SELECT
          users.id,
          settings.currency_symbol AS "currencySymbol",
          COALESCE(SUM(receipts.total) FILTER (WHERE NOT receipts.voided), 0)::float8 AS "salesTotal",
          COUNT(receipts.id) FILTER (WHERE NOT receipts.voided)::int AS "transactionCount",
          COUNT(receipts.id) FILTER (WHERE receipts.voided)::int AS "voidedCount",
          MAX(receipts.created_at) AS "lastTransactionAt"
        FROM users
        LEFT JOIN receipts ON receipts.account_id = users.id
        LEFT JOIN settings ON settings.account_id = users.id AND settings.id = 1
        WHERE users.role IN ('user', 'demo')
        GROUP BY users.id, settings.currency_symbol
      `,
    ]);
  const metricById = new Map(accountMetrics.map((metric) => [metric.id, metric]));
  const dailySalesByAccount = new Map<string, DailySales[]>();
  for (const row of accountDailyRows) {
    const dailySales = dailySalesByAccount.get(row.accountId) ?? [];
    dailySales.push({
      day: row.day,
      total: row.total,
      transactionCount: row.transactionCount,
    });
    dailySalesByAccount.set(row.accountId, dailySales);
  }
  return {
    accounts: accounts
      .filter((account) => account.role !== "admin")
      .map((account): AdminAccountSummary => {
        const metrics = metricById.get(account.id);
        return {
          ...account,
          currencySymbol: metrics?.currencySymbol ?? "$",
          salesTotal: metrics?.salesTotal ?? 0,
          transactionCount: metrics?.transactionCount ?? 0,
          voidedCount: metrics?.voidedCount ?? 0,
          lastTransactionAt:
            metrics?.lastTransactionAt?.toISOString() ?? null,
          dailySales: dailySalesByAccount.get(account.id) ?? [],
        };
      }),
    salesByCurrency,
    transactionCount: accountMetrics.reduce(
      (total, account) => total + account.transactionCount,
      0,
    ),
    activeAccounts: accounts.filter(
      (account) =>
        account.role !== "admin" && account.status === "active",
    ).length,
    dailySales: salesByDay,
    activity: activityRows,
  };
}

export async function getAdminTransactions(
  accountId?: string,
): Promise<AdminTransaction[]> {
  const sql = getClient();
  const rows = await sql<
    (ReceiptRow & {
      accountId: string;
      accountEmail: string;
      currencySymbol: string;
    })[]
  >`
    SELECT
      receipts.id, receipts.number, receipts.created_at AS "createdAt",
      receipts.items, receipts.subtotal, receipts.tax_rate AS "taxRate",
      receipts.tax_total AS "taxTotal", receipts.discount, receipts.total,
      receipts.payment_method AS "paymentMethod",
      receipts.amount_tendered AS "amountTendered",
      receipts.change_due AS "changeDue", receipts.cashier, receipts.note,
      receipts.voided, receipts.account_id AS "accountId",
      users.email AS "accountEmail",
      settings.currency_symbol AS "currencySymbol"
    FROM receipts
    JOIN users ON users.id = receipts.account_id
    JOIN settings ON settings.account_id = receipts.account_id AND settings.id = 1
    ${accountId ? sql`WHERE receipts.account_id = ${accountId}` : sql``}
    ORDER BY receipts.created_at DESC
    LIMIT 1300
  `;
  return rows.map((row) => ({
    ...receiptFromRow(row),
    accountId: row.accountId,
    accountEmail: row.accountEmail,
    currencySymbol: row.currencySymbol,
  }));
}

function getAdminDailySales(sql: ReturnType<typeof getClient>) {
  return sql<DailySales[]>`
    WITH days AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '13 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      to_char(days.day, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(receipts.total) FILTER (WHERE NOT receipts.voided), 0)::float8 AS total,
      COUNT(receipts.id) FILTER (WHERE NOT receipts.voided)::int AS "transactionCount"
    FROM days
    LEFT JOIN receipts
      ON receipts.created_at >= days.day
      AND receipts.created_at < days.day + INTERVAL '1 day'
    GROUP BY days.day
    ORDER BY days.day
  `;
}

function getAdminAccountDailySales(sql: ReturnType<typeof getClient>) {
  return sql<(DailySales & { accountId: string })[]>`
    WITH days AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '13 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      )::date AS day
    ),
    accounts AS (
      SELECT id FROM users WHERE role IN ('user', 'demo')
    )
    SELECT
      accounts.id AS "accountId",
      to_char(days.day, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(receipts.total) FILTER (WHERE NOT receipts.voided), 0)::float8 AS total,
      COUNT(receipts.id) FILTER (WHERE NOT receipts.voided)::int AS "transactionCount"
    FROM accounts
    CROSS JOIN days
    LEFT JOIN receipts
      ON receipts.account_id = accounts.id
      AND receipts.created_at >= days.day
      AND receipts.created_at < days.day + INTERVAL '1 day'
    GROUP BY accounts.id, days.day
    ORDER BY accounts.id, days.day
  `;
}

async function getRecentAccountActivity(
  sql: ReturnType<typeof getClient>,
  accountId?: string,
): Promise<AccountActivity[]> {
  const rows = await sql<AccountActivityRow[]>`
    SELECT
      id,
      account_id AS "accountId",
      account_email AS "accountEmail",
      actor_email AS "actorEmail",
      event_type AS "eventType",
      details,
      created_at AS "createdAt"
    FROM account_activity
    ${accountId ? sql`WHERE account_id = ${accountId}` : sql``}
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return rows.map(accountActivityFromRow);
}

export async function getAccountActivity(
  accountId: string,
): Promise<AccountActivity[]> {
  const sql = getClient();
  return getRecentAccountActivity(sql, accountId);
}
