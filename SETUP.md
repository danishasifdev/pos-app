# Setup Guide — Mall POS

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and open **Connect** in the Supabase dashboard.
   Copy its **Transaction Pooler** connection URI.
3. Replace the placeholder `DATABASE_URL` in `.env.local` with that URI. Keep
   the password private and do not commit `.env.local`.
4. In the Supabase dashboard, open **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql),
   and run it. This creates the tables and adds the sample categories,
   products, and store settings.
   Then run [`supabase/migrations/0002_user_accounts.sql`](./supabase/migrations/0002_user_accounts.sql)
   to add isolated user workspaces. Existing products and receipts stay in
   the permanent demo workspace. Also run migrations
   [`supabase/migrations/0003_demo_email.sql`](./supabase/migrations/0003_demo_email.sql)
   and [`supabase/migrations/0004_account_activity.sql`](./supabase/migrations/0004_account_activity.sql)
   to update the demo account email and enable dashboard activity history.
   If the first three migrations have already been applied, run only migration
   0004 to enable the dashboards.
5. Start the app:

   ```bash
   npm run dev
   ```

6. Check the database connection at http://localhost:3000/api/health. A
   successful connection returns `{"status":"ok","database":"connected"}`.
   On Vercel, open `https://YOUR_DEPLOYMENT_URL/api/health`. A failure returns
   HTTP 503 without exposing connection details.
7. The portfolio demo workspace is public and has no sign-in. Anyone can use
   and modify its sample POS data. Visitors can create accounts to get isolated
   workspaces.
8. For account sessions locally, add a long random `APP_SESSION_SECRET` and a
   separate `CRON_SECRET` to `.env.local`.

## Deploying to Vercel

In the Vercel project, add `DATABASE_URL` under **Settings → Environment
Variables** for Production (and Preview if needed). Use the same Supabase
Transaction Pooler URI, and make sure it is not the placeholder in
`.env.example`. Redeploy after changing environment variables.

The portfolio demo is intentionally public and has no sign-in. Anyone can
read and modify its products, settings, and receipt data. Use a separate
Supabase project containing only disposable demo data. Do not store real
customer information in the demo workspace. Public registration creates
separate workspaces, with a maximum of 25 user accounts.

Add `APP_SESSION_SECRET` and `CRON_SECRET` to the Vercel environment variables,
each with a unique random value. `APP_SESSION_SECRET` signs and verifies
sessions; without it, logins cannot be trusted. `CRON_SECRET` authorizes the
scheduled inactivity cleanup. Since the administrator account already exists,
there is no public admin-creation route or setup secret. The administrator
dashboard at `/admin` shows account summaries, each workspace's sales trends,
transactions, and activity history. It also lets the admin
disable/reactivate accounts or delete a user's workspace and data. Use
`/admin/login` for administrator sign-in. Regular user accounts are disabled
after 90 days without login; their data is retained until the admin deletes
it. The built-in demo workspace (`pos-app@demo.com`) is available from the
sign-in page's `Continue with demo account to log in` button. It is never
disabled or counted toward the 25-account limit. Users can view their own
trends, transactions, and activity at `/dashboard`.

Vercel runs the daily account inactivity cleanup using `CRON_SECRET`.

The database client uses the Postgres transaction pooler with prepared
statements disabled and a small per-instance connection pool. Keep the
connection URI in server-side environment variables only; it must not use a
`NEXT_PUBLIC_` prefix.

## Database and seed data

The schema migration creates `categories`, `products`, `settings`, and
`receipts`. Row-level security is enabled on those tables so the tables are
not exposed through the Supabase Data API without policies. The app connects
from the server with `DATABASE_URL`.

The migration is idempotent for creating tables and adding the initial seed
rows: it is safe to run again, and existing rows with the seed IDs are not
overwritten. If the Supabase tables already contain data, the initial seed
inserts do not replace it.

All reads and writes go through [`src/lib/db.ts`](./src/lib/db.ts). The routes
and server-rendered pages use that shared layer. Receipt creation locks the
settings row inside a transaction, so simultaneous checkouts receive unique
sequential receipt numbers.
