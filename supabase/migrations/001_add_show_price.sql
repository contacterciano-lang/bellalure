-- ════════════════════════════════════════════════════════════════
--  Bellalure — Migration 001 : colonne "show_price"
-- ════════════════════════════════════════════════════════════════
--
--  POURQUOI : permet de masquer le prix d'un produit. Quand
--  show_price = false, le storefront affiche "Prix sur demande" et le
--  bouton "Demander le prix sur WhatsApp" au lieu du prix.
--
--  COMMENT L'APPLIQUER (une seule fois, ~30 secondes) :
--    1. Ouvrir https://supabase.com → votre projet Bellalure
--    2. Menu de gauche → "SQL Editor" → "New query"
--    3. Coller le bloc ci-dessous puis cliquer "Run"
--
--  Sans cette colonne, l'API continue de fonctionner (le prix reste
--  simplement toujours visible) — rien ne casse, mais le masquage ne
--  sera pas persistant côté serveur.
-- ════════════════════════════════════════════════════════════════

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_price boolean NOT NULL DEFAULT true;
