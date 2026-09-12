# Mall POS

A point-of-sale terminal for mall kiosks and small retail stores — built with
Next.js (App Router) and Tailwind CSS. Ring up products, take payment, print
an 80mm-style receipt, and browse/reprint/void past sales.

## Features

- **Terminal** — category tabs, product search, tap-to-add cart, cash/card/
  mobile checkout with a cash numpad and automatic change calculation
- **Printing** — a proper receipt layout (store header, line items, tax,
  total, payment/change) that prints cleanly via the browser's print dialog —
  works with any printer registered on the OS, including 80mm thermal
  receipt printers
- **Receipt history** — every sale is saved, searchable by receipt number or
  item, reprintable, voidable
- **Product manager** — add/edit/hide/delete products and see them reflected
  on the terminal instantly
- **Store settings** — store name/address/phone, tax rate, currency symbol,
  receipt footer message
- **Themes** — 6 built-in color themes (Slate, Emerald, Indigo, Rose, Amber,
  Midnight) switchable from any page, saved per-browser

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Sample products and categories are seeded
automatically on first run — no database setup required.

See **[SETUP.md](./SETUP.md)** for how the built-in database works and how
to upgrade to Postgres/Prisma or SQLite when you're ready for production.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4 (CSS-variable based theme system)
- TypeScript
- A dependency-free JSON file database (see SETUP.md) — no external DB, no
  native modules, works immediately after `npm install`
