-- ============================================
-- AUDIT-LOGS (Änderungshistorie für Compliance)
-- ============================================

-- Tabelle für Audit-Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Nur User kann eigene Logs sehen" ON audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System kann Logs erstellen" ON audit_logs FOR INSERT WITH CHECK (true);

-- Automatische Trigger-Funktion für Audit-Logs
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_data)
    VALUES (auth.uid(), TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_data, new_data, changed_fields)
    VALUES (
      auth.uid(), 
      TG_TABLE_NAME, 
      NEW.id, 
      'UPDATE', 
      row_to_json(OLD), 
      row_to_json(NEW),
      ARRAY(
        SELECT jsonb_object_keys(row_to_json(NEW)) 
        INTERSECT 
        SELECT jsonb_object_keys(row_to_json(OLD))
      )
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger für wichtige Tabellen erstellen
-- Beispiel für houses Tabelle
DROP TRIGGER IF EXISTS houses_audit_trigger ON houses;
CREATE TRIGGER houses_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON houses
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Trigger für apartments Tabelle
DROP TRIGGER IF EXISTS apartments_audit_trigger ON apartments;
CREATE TRIGGER apartments_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON apartments
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Trigger für finances Tabelle
DROP TRIGGER IF EXISTS finances_audit_trigger ON finances;
CREATE TRIGGER finances_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON finances
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
