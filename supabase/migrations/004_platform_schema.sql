-- ════════════════════════════════════════════════════════════════
--  Bellalure — Migration 004 : plateforme e-commerce (Phase 1)
-- ════════════════════════════════════════════════════════════════
--  Tables : orders, customers, suppliers + enrichissement products.
--  À exécuter dans Supabase → SQL Editor → New query → Run.
-- ════════════════════════════════════════════════════════════════

-- ─── PRODUCTS : prix fournisseur + statut + couleurs + autorisation UPDATE ───
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_price numeric NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT '[]'::jsonb;

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

-- ─── ORDERS : 1 commande = 1 produit, calculs AUTOMATIQUES ───
--  total_amount / supplier_total / profit sont calculés par la base
--  (colonnes générées) → impossible de se tromper, jamais à recalculer.
CREATE TABLE IF NOT EXISTS orders (
  id               text PRIMARY KEY,
  product_id       text,
  product_name     text NOT NULL,
  product_image    text,
  product_category text,
  customer_name    text,
  customer_phone   text,
  quantity         integer NOT NULL DEFAULT 1,
  selling_price    numeric NOT NULL DEFAULT 0,
  supplier_price   numeric NOT NULL DEFAULT 0,
  total_amount     numeric GENERATED ALWAYS AS (selling_price * quantity) STORED,
  supplier_total   numeric GENERATED ALWAYS AS (supplier_price * quantity) STORED,
  profit           numeric GENERATED ALWAYS AS ((selling_price - supplier_price) * quantity) STORED,
  show_price       boolean DEFAULT true,
  action           text DEFAULT 'commander',
  status           text NOT NULL DEFAULT 'nouveau',
  source           text DEFAULT 'whatsapp',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_orders" ON orders;
CREATE POLICY "anon_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- ─── CUSTOMERS ───
CREATE TABLE IF NOT EXISTS customers (
  id           text PRIMARY KEY,
  name         text,
  phone        text UNIQUE,
  city         text,
  total_orders integer DEFAULT 0,
  total_spent  numeric DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_customers" ON customers;
CREATE POLICY "anon_all_customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- ─── SUPPLIERS ───
CREATE TABLE IF NOT EXISTS suppliers (
  id               text PRIMARY KEY,
  name             text NOT NULL,
  country          text,
  whatsapp         text,
  product_category text,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_suppliers" ON suppliers;
CREATE POLICY "anon_all_suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
