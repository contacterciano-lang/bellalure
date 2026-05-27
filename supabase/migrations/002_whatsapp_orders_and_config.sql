-- ════════════════════════════════════════════════════════════════
--  Bellalure — Migration 002 : commandes WhatsApp + config globale
-- ════════════════════════════════════════════════════════════════
--
--  POURQUOI :
--   • whatsapp_orders : chaque clic client "Commander" / "Demander le
--     prix" est enregistré ici → visible dans l'admin SUR TOUS LES
--     APPAREILS (le localStorage ne marchait que sur ton navigateur).
--   • site_config : stocke des réglages globaux côté serveur, ex. le
--     masquage global des prix (clé "show_prices_global").
--
--  COMMENT L'APPLIQUER (une seule fois, ~30 s) :
--    Supabase → ton projet → SQL Editor → New query → coller → Run.
-- ════════════════════════════════════════════════════════════════

-- ─── Table des commandes WhatsApp ───
CREATE TABLE IF NOT EXISTS whatsapp_orders (
  id               text PRIMARY KEY,
  product_id       text,
  product_name     text NOT NULL,
  product_image    text,
  product_category text,
  price            numeric DEFAULT 0,
  show_price       boolean DEFAULT true,
  action           text NOT NULL DEFAULT 'commander',
  whatsapp_number  text,
  quantity         integer DEFAULT 1,
  size             text,
  color            text,
  status           text NOT NULL DEFAULT 'nouveau',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_whatsapp_orders" ON whatsapp_orders;
CREATE POLICY "anon_all_whatsapp_orders" ON whatsapp_orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS whatsapp_orders_created_at_idx
  ON whatsapp_orders (created_at DESC);

-- ─── Table de configuration (clé / valeur) ───
CREATE TABLE IF NOT EXISTS site_config (
  key        text PRIMARY KEY,
  value      jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_site_config" ON site_config;
CREATE POLICY "anon_all_site_config" ON site_config
  FOR ALL USING (true) WITH CHECK (true);
