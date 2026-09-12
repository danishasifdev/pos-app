# Setup Guide — Mall POS

This document explains how the app's data layer works out of the box, how to
run it, and how to upgrade it to a real production database later without
rewriting the app.

---

## 1. Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. That's it — there is nothing else to configure.
The first time the app runs, it creates a `data/` folder in the project root
and seeds it with sample categories, products, and store settings.

To reset everything back to the sample data, just delete the JSON files:

```bash
rm data/*.json
```

They'll be recreated automatically on the next request.

---

## 2. How the built-in database works

Instead of requiring Postgres, MySQL, or a native SQLite binding (which need
a running server or a compiled module — extra setup that doesn't belong in a
"clone and run" demo), this app ships with a tiny **file-based JSON database**
that lives entirely inside the project:

```
data/
  categories.json   -> Category[]
  products.json      -> Product[]
  receipts.json       -> Receipt[]   (every saved sale, newest first)
  settings.json       -> StoreSettings (single object: store name, tax rate, theme…)
```

All reads and writes go through one file:

```
src/lib/db.ts
```

That file exposes plain, typed functions — `getProducts()`, `addReceipt()`,
`updateProduct()`, `getSettings()`, `saveSettings()`, and so on. Every API
route in `src/app/api/**/route.ts` calls these functions instead of touching
the filesystem directly. **This is the seam you use to swap databases** —
change what's inside `db.ts`, keep every function's name and return type the
same, and the rest of the app (API routes, pages, components) needs no
changes at all.

Writes are "atomic": each save writes to a temporary file first, then renames
it over the real file, so a crash mid-write can never corrupt your data.

### Why not SQLite/Prisma out of the box?

They're great options (see §3), but `better-sqlite3` needs a native module
compiled for your OS/Node version, and Prisma downloads its own query-engine
binary on `npm install`. Both are perfectly fine on a normal developer
machine with internet access, but they add a step that can fail in locked-down
or offline environments. The JSON layer guarantees the app runs anywhere the
moment `npm install` finishes — you can upgrade later once you know you need
to.

### Types

All data shapes live in `src/lib/types.ts`:

- `Category` — id, name, color, sortOrder
- `Product` — id, name, price, categoryId, emoji, sku, taxable, active
- `Receipt` — id, number, createdAt, items, subtotal, taxRate, taxTotal, discount, total, paymentMethod, amountTendered, changeDue, cashier, voided
- `StoreSettings` — storeName, address, phone, taxRate, currencySymbol, receiptFooter, theme, nextReceiptNumber

---

## 3. Upgrading to a real database

When you outgrow a single-kiosk JSON file (multiple registers writing at
once, need for backups/replicas, hosting on a platform with an ephemeral
filesystem like Vercel), swap in a real database. Two good paths:

### Option A — Prisma + Postgres (recommended for production / multi-register setups)

1. Install Prisma:
   ```bash
   npm install prisma @prisma/client
   npx prisma init --datasource-provider postgresql
   ```
2. In `.env`, set `DATABASE_URL` to your Postgres connection string (e.g. a
   free instance from Supabase, Neon, or Railway, or a local
   `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`).
3. Copy the shapes in `src/lib/types.ts` into `prisma/schema.prisma`, e.g.:

   ```prisma
   model Category {
     id        String    @id @default(cuid())
     name      String
     color     String
     sortOrder Int
     products  Product[]
   }

   model Product {
     id         String   @id @default(cuid())
     name       String
     price      Float
     emoji      String
     sku        String
     taxable    Boolean  @default(true)
     active     Boolean  @default(true)
     categoryId String
     category   Category @relation(fields: [categoryId], references: [id])
   }

   model Receipt {
     id             String        @id @default(cuid())
     number         String
     createdAt      DateTime      @default(now())
     subtotal       Float
     taxRate        Float
     taxTotal       Float
     discount       Float
     total          Float
     paymentMethod  String
     amountTendered Float
     changeDue      Float
     cashier        String
     note           String?
     voided         Boolean       @default(false)
     items          ReceiptItem[]
   }

   model ReceiptItem {
     id        String  @id @default(cuid())
     productId String
     name      String
     price     Float
     quantity  Int
     receiptId String
     receipt   Receipt @relation(fields: [receiptId], references: [id])
   }

   model StoreSettings {
     id                 String @id @default("singleton")
     storeName          String
     address            String
     phone              String
     taxRate            Float
     currencySymbol     String
     receiptFooter      String
     theme              String
     nextReceiptNumber  Int
   }
   ```

4. Run the migration and generate the client:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Rewrite the functions inside `src/lib/db.ts` to call
   `prisma.product.findMany()`, `prisma.receipt.create()`, etc. instead of
   reading/writing JSON files. Keep the function names and return shapes the
   same as they are now — nothing else in the app has to change.
6. Seed sample data with a `prisma/seed.ts` script that inserts the arrays
   already defined in `src/lib/seed.ts`.

### Option B — SQLite via `better-sqlite3` (good middle ground: still a single file, but a real relational database with SQL and indexes)

1. `npm install better-sqlite3`
2. Create `src/lib/sqlite.ts` that opens `data/pos.db` and runs `CREATE TABLE
   IF NOT EXISTS …` statements for `categories`, `products`, `receipts`, and
   `receipt_items` on startup.
3. Update the functions in `src/lib/db.ts` to run SQL (`db.prepare(...)`)
   instead of reading JSON, keeping the same function signatures.
4. Because this is a native module, run `npm rebuild better-sqlite3` if you
   ever change Node versions or move to a new machine/container.

Either path is a drop-in replacement: the API routes, pages, and components
never talk to storage directly, so migrating the database is isolated to
`src/lib/db.ts` (and, for Option A, adding a `schema.prisma`).

---

## 4. Deploying

- **Single kiosk / local machine**: the default JSON setup works as-is —
  just run `npm run build && npm start` on the machine that has the printer
  attached, and browser printing (`window.print()`) sends the receipt to
  whatever printer is set as default in the OS print dialog (works well with
  cheap 80mm thermal receipt printers that install as a normal system
  printer).
- **Hosted (Vercel, etc.)**: switch to Option A (Postgres) first — hosted
  platforms don't guarantee a persistent filesystem between deploys, so the
  JSON files would reset.

---

## 5. Project structure

```
src/
  app/
    page.tsx                 -> POS terminal (home page)
    receipts/page.tsx         -> receipt history
    receipts/[id]/page.tsx    -> single receipt / reprint / void
    products/page.tsx         -> product catalog manager
    settings/page.tsx         -> store info + theme
    api/
      products/route.ts        -> GET list, POST create
      products/[id]/route.ts   -> PUT update, DELETE
      categories/route.ts      -> GET list, POST create
      receipts/route.ts        -> GET list, POST create (server computes totals)
      receipts/[id]/route.ts   -> GET one, DELETE (void)
      settings/route.ts        -> GET, PUT (partial patch)
  components/                -> all client UI (cart, grid, modals, theme switcher…)
  lib/
    types.ts    -> shared TypeScript types
    db.ts       -> the data layer (the file you swap out to change databases)
    seed.ts     -> sample categories/products/settings
    themes.ts   -> theme metadata for the switcher
data/                        -> JSON "database" files (git-ignored, auto-created)
```
