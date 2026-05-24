-- ============================================
-- APP-NEWSFEED (global, nur Admin bearbeitet)
-- ============================================
-- Nach dem Ausführen: Deine Admin-E-Mail eintragen:
--   INSERT INTO site_admins (email) VALUES ('deine@email.de');
-- ============================================

CREATE TABLE IF NOT EXISTS site_admins (
  email TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS app_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_news_created_at ON app_news(created_at DESC);

ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news ENABLE ROW LEVEL SECURITY;

-- Jeder Nutzer darf prüfen, ob seine eigene E-Mail Admin ist (für Einstellungen-UI)
CREATE POLICY "User can check own admin status"
  ON site_admins FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- News: öffentlich auf Startseite + für eingeloggte Nutzer
CREATE POLICY "Public can read news"
  ON app_news FOR SELECT TO anon, authenticated
  USING (true);

-- News: nur Einträge in site_admins dürfen schreiben
CREATE POLICY "Site admin can insert news"
  ON app_news FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') IN (SELECT email FROM site_admins)
  );

CREATE POLICY "Site admin can update news"
  ON app_news FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN (SELECT email FROM site_admins)
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') IN (SELECT email FROM site_admins)
  );

CREATE POLICY "Site admin can delete news"
  ON app_news FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN (SELECT email FROM site_admins)
  );
