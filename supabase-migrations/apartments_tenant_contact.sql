-- Mieter-Kontakt für Wohnungen (in Supabase SQL Editor ausführen)
ALTER TABLE apartments
  ADD COLUMN IF NOT EXISTS tenant_phone TEXT,
  ADD COLUMN IF NOT EXISTS tenant_email TEXT;
