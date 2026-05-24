-- ============================================
-- HAUSPILOT - Vollständiges Supabase Setup
-- ============================================
-- Dieses Skript erstellt alle Tabellen, Storage Buckets,
-- Policies und Indizes für die Hauspilot App.
-- Führe dieses Skript im Supabase SQL Editor aus.
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. STORAGE BUCKETS
-- ============================================
-- Dokumenten-Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- PDF-Templates Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. STORAGE POLICIES
-- ============================================
-- Dokumenten-Storage Policies
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- PDF-Templates Storage Policies
CREATE POLICY "Users can upload templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their templates"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 4. TABLES
-- ============================================

-- ============================================
-- VERMIETER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vermieter (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  adresse TEXT,
  plz TEXT,
  ort TEXT,
  telefon TEXT,
  email TEXT,
  iban TEXT,
  bic TEXT,
  bankname TEXT,
  kontoinhaber TEXT,
  kontonummer TEXT,
  blz TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HOUSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS houses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street TEXT,
  house_number TEXT,
  city TEXT,
  postal_code TEXT,
  monthlyLoan NUMERIC DEFAULT 0,
  interestRate NUMERIC DEFAULT 0,
  costs JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- APARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS apartments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tenant TEXT,
  tenant2 TEXT,
  persons INTEGER DEFAULT 1,
  kaltmiete NUMERIC DEFAULT 0,
  warmmiete NUMERIC DEFAULT 0,
  deposit NUMERIC DEFAULT 0,
  notes TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  house_id TEXT REFERENCES houses(id) ON DELETE CASCADE,
  apartment_id TEXT REFERENCES apartments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT DEFAULT '00:00',
  description TEXT,
  appointment_type TEXT DEFAULT 'other',
  maintenance_interval_months INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  house_id TEXT REFERENCES houses(id) ON DELETE CASCADE,
  apartment_id TEXT REFERENCES apartments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DOCUMENT_TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. INDEXES
-- ============================================

-- Vermieter Indexes
CREATE INDEX IF NOT EXISTS idx_vermieter_user_id ON vermieter(user_id);
CREATE INDEX IF NOT EXISTS idx_vermieter_created_at ON vermieter(created_at);

-- Houses Indexes
CREATE INDEX IF NOT EXISTS idx_houses_user_id ON houses(user_id);
CREATE INDEX IF NOT EXISTS idx_houses_created_at ON houses(created_at);

-- Apartments Indexes
CREATE INDEX IF NOT EXISTS idx_apartments_user_id ON apartments(user_id);
CREATE INDEX IF NOT EXISTS idx_apartments_house_id ON apartments(house_id);
CREATE INDEX IF NOT EXISTS idx_apartments_created_at ON apartments(created_at);

-- Appointments Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_house_id ON appointments(house_id);
CREATE INDEX IF NOT EXISTS idx_appointments_apartment_id ON appointments(apartment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_house_id ON transactions(house_id);
CREATE INDEX IF NOT EXISTS idx_transactions_apartment_id ON transactions(apartment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Document Templates Indexes
CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_at ON document_templates(created_at);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE vermieter ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERMIETER POLICIES
-- ============================================
CREATE POLICY "Users can view their vermieter"
ON vermieter FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their vermieter"
ON vermieter FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their vermieter"
ON vermieter FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their vermieter"
ON vermieter FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- HOUSES POLICIES
-- ============================================
CREATE POLICY "Users can view their houses"
ON houses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their houses"
ON houses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their houses"
ON houses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their houses"
ON houses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- APARTMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view their apartments"
ON apartments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their apartments"
ON apartments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their apartments"
ON apartments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their apartments"
ON apartments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view their appointments"
ON appointments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their appointments"
ON appointments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their appointments"
ON appointments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their transactions"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their transactions"
ON transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their transactions"
ON transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- DOCUMENT_TEMPLATES POLICIES
-- ============================================
CREATE POLICY "Users can view their document_templates"
ON document_templates FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their document_templates"
ON document_templates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their document_templates"
ON document_templates FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their document_templates"
ON document_templates FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
CREATE TRIGGER update_vermieter_updated_at
    BEFORE UPDATE ON vermieter
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at
    BEFORE UPDATE ON houses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at
    BEFORE UPDATE ON apartments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. CLEANUP FUNCTIONS (OPTIONAL)
-- ============================================

-- Function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM document_templates WHERE user_id = user_uuid;
    DELETE FROM transactions WHERE user_id = user_uuid;
    DELETE FROM appointments WHERE user_id = user_uuid;
    DELETE FROM apartments WHERE user_id = user_uuid;
    DELETE FROM houses WHERE user_id = user_uuid;
    DELETE FROM vermieter WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Alle Tabellen, Storage Buckets, Policies und Indizes wurden erstellt.
-- Die App ist jetzt bereit für die Verwendung.
-- ============================================
