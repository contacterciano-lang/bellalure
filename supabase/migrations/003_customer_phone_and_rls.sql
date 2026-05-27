-- ════════════════════════════════════════════════════════════════
--  Bellalure — Migration 003 : numéro client + RLS produits
-- ════════════════════════════════════════════════════════════════
--  À exécuter dans Supabase → SQL Editor → New query → Run.
-- ════════════════════════════════════════════════════════════════

-- 1) Numéro du client sur chaque commande WhatsApp (pour le notifier)
ALTER TABLE whatsapp_orders
  ADD COLUMN IF NOT EXISTS customer_phone text;

-- 2) Autoriser la modification des produits (édition admin des produits
--    déjà en base). La table acceptait l'INSERT mais bloquait l'UPDATE.
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products
  FOR UPDATE USING (true) WITH CHECK (true);
