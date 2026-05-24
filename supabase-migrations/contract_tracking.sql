-- ============================================
-- VERTRAGSLAUFZEITEN-TRACKING (Mieter-Management)
-- ============================================

-- Neue Felder für apartments Tabelle für Vertragslaufzeiten
ALTER TABLE apartments 
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS notice_period_months INTEGER DEFAULT 3, -- Kündigungsfrist in Monaten
ADD COLUMN IF NOT EXISTS rent_increase_date DATE, -- Nächste Mietpreiserhöhung
ADD COLUMN IF NOT EXISTS rent_increase_percentage DECIMAL(5,2), -- Prozentsatz der Erhöhung
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE, -- Ist der Mieter aktiv?
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2), -- Kaution
ADD COLUMN IF NOT EXISTS move_in_date DATE,
ADD COLUMN IF NOT EXISTS move_out_date DATE;

-- Tabelle für Vertragsänderungen
CREATE TABLE IF NOT EXISTS contract_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type VARCHAR(50) NOT NULL, -- rent_increase, contract_extension, tenant_change
  old_value JSONB,
  new_value JSONB,
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Mieter-Historie (für Tracking von Mieterwechseln)
CREATE TABLE IF NOT EXISTS tenant_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  tenant_name VARCHAR(200) NOT NULL,
  tenant_email VARCHAR(200),
  tenant_phone VARCHAR(50),
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  monthly_rent DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Erinnerungen (Mietzahlungen, Vertragsende, Wartung)
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- apartment, house, document
  entity_id UUID NOT NULL,
  reminder_type VARCHAR(50) NOT NULL, -- rent_payment, contract_end, maintenance, inspection
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  recurring BOOLEAN DEFAULT FALSE, -- Wiederkehrende Erinnerung
  recurring_interval VARCHAR(20), -- daily, weekly, monthly, yearly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_contract_changes_apartment ON contract_changes(apartment_id);
CREATE INDEX IF NOT EXISTS idx_tenant_history_apartment ON tenant_history(apartment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_entity ON reminders(entity_type, entity_id);

-- Row Level Security (RLS)
ALTER TABLE contract_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "User kann eigene Vertragsänderungen sehen" ON contract_changes FOR SELECT USING (
  apartment_id IN (SELECT id FROM apartments WHERE house_id IN (SELECT id FROM houses WHERE user_id = auth.uid()))
);
CREATE POLICY "User kann eigene Vertragsänderungen erstellen" ON contract_changes FOR INSERT WITH CHECK (
  apartment_id IN (SELECT id FROM apartments WHERE house_id IN (SELECT id FROM houses WHERE user_id = auth.uid()))
);

CREATE POLICY "User kann eigene Mieter-Historie sehen" ON tenant_history FOR SELECT USING (
  apartment_id IN (SELECT id FROM apartments WHERE house_id IN (SELECT id FROM houses WHERE user_id = auth.uid()))
);
CREATE POLICY "User kann eigene Mieter-Historie erstellen" ON tenant_history FOR INSERT WITH CHECK (
  apartment_id IN (SELECT id FROM apartments WHERE house_id IN (SELECT id FROM houses WHERE user_id = auth.uid()))
);

CREATE POLICY "User kann eigene Erinnerungen sehen" ON reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Erinnerungen erstellen" ON reminders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User kann eigene Erinnerungen aktualisieren" ON reminders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Erinnerungen löschen" ON reminders FOR DELETE USING (user_id = auth.uid());

-- Trigger für automatische Erinnerungen bei Vertragsende
CREATE OR REPLACE FUNCTION check_contract_end_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Erinnerung 30 Tage vor Vertragsende erstellen
  IF NEW.contract_end_date IS NOT NULL AND OLD.contract_end_date IS NULL THEN
    INSERT INTO reminders (user_id, entity_type, entity_id, reminder_type, title, description, due_date)
    VALUES (
      (SELECT user_id FROM houses WHERE id = (SELECT house_id FROM apartments WHERE id = NEW.id)),
      'apartment',
      NEW.id,
      'contract_end',
      'Vertragsende: ' || NEW.name,
      'Der Mietvertrag endet am ' || NEW.contract_end_date,
      NEW.contract_end_date - INTERVAL '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für apartments Tabelle
DROP TRIGGER IF EXISTS contract_end_reminder_trigger ON apartments;
CREATE TRIGGER contract_end_reminder_trigger
AFTER INSERT OR UPDATE OF contract_end_date ON apartments
FOR EACH ROW EXECUTE FUNCTION check_contract_end_reminders();
