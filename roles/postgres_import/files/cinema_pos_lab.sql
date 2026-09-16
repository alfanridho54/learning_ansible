CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL,
  price_idr INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  outlet_code VARCHAR(16) NOT NULL,
  total_idr INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO products (sku, name, category, price_idr) VALUES
  ('TKT-AVN', 'Tiket Avatar Re-Release', 'ticket', 65000),
  ('TKT-DNE', 'Tiket Dune Part Three', 'ticket', 70000),
  ('SNK-POP', 'Popcorn Large', 'snack', 45000),
  ('SNK-SOD', 'Soda Medium', 'snack', 25000)
ON CONFLICT (sku) DO NOTHING;
