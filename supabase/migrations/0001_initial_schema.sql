CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
  category_id TEXT NOT NULL REFERENCES categories(id),
  emoji TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  taxable BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS settings (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  store_name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  tax_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency_symbol TEXT NOT NULL DEFAULT '$',
  receipt_footer TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'slate'
    CHECK (theme IN ('slate', 'emerald', 'indigo', 'rose', 'amber', 'midnight')),
  next_receipt_number INTEGER NOT NULL DEFAULT 1 CHECK (next_receipt_number > 0)
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax_rate DOUBLE PRECISION NOT NULL,
  tax_total DOUBLE PRECISION NOT NULL,
  discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile')),
  amount_tendered DOUBLE PRECISION NOT NULL,
  change_due DOUBLE PRECISION NOT NULL,
  cashier TEXT NOT NULL,
  note TEXT,
  voided BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS receipts_created_at_idx ON receipts (created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

INSERT INTO settings (
  id, store_name, address, phone, tax_rate, currency_symbol,
  receipt_footer, theme, next_receipt_number
)
VALUES (
  1, 'Skyline Mall Kiosk', '2nd Floor, Skyline Shopping Mall',
  '+1 (555) 010-2030', 8.5, '$', 'Thank you for shopping with us!',
  'slate', 1
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, color, sort_order)
VALUES
  ('cat-drinks', 'Drinks', '#3b82f6', 0),
  ('cat-bakery', 'Bakery', '#f59e0b', 1),
  ('cat-snacks', 'Snacks', '#10b981', 2),
  ('cat-meals', 'Meals', '#ef4444', 3),
  ('cat-merch', 'Merch', '#8b5cf6', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
  id, name, price, category_id, emoji, sku, taxable, active
)
VALUES
  ('p-1', 'Iced Latte', 4.5, 'cat-drinks', '🧋', 'DR-001', TRUE, TRUE),
  ('p-2', 'Cold Brew', 4.0, 'cat-drinks', '🥤', 'DR-002', TRUE, TRUE),
  ('p-3', 'Orange Juice', 3.5, 'cat-drinks', '🧃', 'DR-003', TRUE, TRUE),
  ('p-4', 'Bottled Water', 1.5, 'cat-drinks', '💧', 'DR-004', FALSE, TRUE),
  ('p-5', 'Croissant', 3.25, 'cat-bakery', '🥐', 'BK-001', TRUE, TRUE),
  ('p-6', 'Muffin', 2.75, 'cat-bakery', '🧁', 'BK-002', TRUE, TRUE),
  ('p-7', 'Bagel', 2.5, 'cat-bakery', '🥯', 'BK-003', TRUE, TRUE),
  ('p-8', 'Pretzel', 2.25, 'cat-snacks', '🥨', 'SN-001', TRUE, TRUE),
  ('p-9', 'Chips', 2.0, 'cat-snacks', '🍟', 'SN-002', TRUE, TRUE),
  ('p-10', 'Popcorn', 3.0, 'cat-snacks', '🍿', 'SN-003', TRUE, TRUE),
  ('p-11', 'Sandwich', 6.5, 'cat-meals', '🥪', 'ML-001', TRUE, TRUE),
  ('p-12', 'Burger', 7.75, 'cat-meals', '🍔', 'ML-002', TRUE, TRUE),
  ('p-13', 'Salad Bowl', 6.0, 'cat-meals', '🥗', 'ML-003', TRUE, TRUE),
  ('p-14', 'Pizza Slice', 4.25, 'cat-meals', '🍕', 'ML-004', TRUE, TRUE),
  ('p-15', 'Tote Bag', 9.0, 'cat-merch', '👜', 'MC-001', TRUE, TRUE),
  ('p-16', 'Mug', 8.0, 'cat-merch', '☕', 'MC-002', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;
