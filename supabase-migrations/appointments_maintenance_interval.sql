-- Wartungsintervall für Termine (in Supabase SQL Editor ausführen)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS maintenance_interval_months INTEGER;
