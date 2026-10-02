CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'demo')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  CHECK (role <> 'demo' OR status = 'active'),
  CHECK ((role = 'demo' AND password_hash IS NULL) OR (role <> 'demo' AND password_hash IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_single_admin_idx ON users (role) WHERE role = 'admin';

INSERT INTO users (id, email, password_hash, role, status, created_at, last_login_at)
VALUES ('demo', 'pos-app@demo.com', NULL, 'demo', 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
WHERE users.role = 'demo';

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS account_id TEXT NOT NULL DEFAULT 'demo'
  REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS account_id TEXT NOT NULL DEFAULT 'demo'
  REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS account_id TEXT NOT NULL DEFAULT 'demo'
  REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS account_id TEXT NOT NULL DEFAULT 'demo'
  REFERENCES users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS categories_account_id_id_idx
  ON categories (account_id, id);
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_account_category_fkey;
ALTER TABLE products ADD CONSTRAINT products_account_category_fkey
  FOREIGN KEY (account_id, category_id)
  REFERENCES categories (account_id, id)
  ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS products_account_id_idx ON products (account_id);

ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE settings ADD CONSTRAINT settings_pkey PRIMARY KEY (account_id, id);

ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS receipts_account_number_idx
  ON receipts (account_id, number);
CREATE INDEX IF NOT EXISTS receipts_account_created_at_idx
  ON receipts (account_id, created_at DESC);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
