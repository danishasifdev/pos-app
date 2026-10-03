# Mall POS

A point-of-sale terminal for mall kiosks and small retail, running in production
at a kiosk. Cash/card checkout with change calculation, 80mm thermal receipt
printing, searchable and voidable sale history, and a live product manager.

**[**Try it live →**](https://pos-app-seven-swart.vercel.app/)** — no account needed to try
it: the terminal loads straight away and you can ring up a complete sale and
print the receipt before you decide to sign in. Everything you do as a visitor
is discarded on reload. Use disposable data only.

- Next.js 16 (App Router, Turbopack) on Vercel
- Tailwind CSS v4, CSS-variable theming
- Supabase Postgres (transaction pooler), per-account workspaces
- Cookie sessions: HMAC-signed, `httpOnly`, `sameSite: strict`

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

## Accounts and workspaces

Every account gets its own isolated workspace in Postgres — separate products,
categories, settings, receipts and sales history.

You do not need an account to use the terminal. A signed-out visitor gets a
throwaway scratch workspace seeded with sample products, and can do everything a
real cashier does: search, build a cart, add and edit products, take cash/card
payment, and print a receipt. Those writes go to `data/ephemeral.json` (git
ignored) and are **erased the moment the page is reloaded** — so a demo sale
numbers, totals and prints correctly without ever being kept. In-app navigation
does not wipe it, so you can move between the terminal and the product manager
mid-session. The banner, the product manager and the receipt screen all say so
plainly, and each points at creating a free account.

`APP_SESSION_SECRET` signs the session cookie; `CRON_SECRET` authorizes the
daily inactivity cleanup. Regular accounts are disabled after 90 days without a
login, and their data is retained until an administrator deletes it. The built-in
demo workspace is always available and never counts toward the 25-account limit.

> On serverless hosting the scratch file is not durable across cold starts; it
> degrades to a per-request in-memory store rather than failing. Run it on a
> long-lived Node server (or locally) to see the file-backed behaviour.

## Quick start

```bash
npm install
npm run dev
```

Before starting the app, set `DATABASE_URL` and `APP_SESSION_SECRET` in
`.env.local` and run the SQL migrations. See **[SETUP.md](./SETUP.md)** for the
exact steps — they add the demo data, private workspaces, the demo account, and
activity history for the dashboards.

Then open http://localhost:3000.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4 (CSS-variable based theme system)
- TypeScript
- Supabase Postgres accessed through its transaction pooler for Vercel
