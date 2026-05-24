-- ============================================
-- KOMMENTARE & NOTIZEN (Collaboration Features)
-- ============================================

-- Tabelle für Kommentare
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL, -- house, apartment, document, finance
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Für Threaded Comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Tabelle für Notizen
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL, -- house, apartment, document, finance
  entity_id UUID NOT NULL,
  title VARCHAR(200),
  content TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Für farbige Markierung
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Tabelle für Tags (für bessere Organisation)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Tabelle für Entity-Tags (Viele-zu-Viele Beziehung)
CREATE TABLE IF NOT EXISTS entity_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, tag_id)
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_tag_id ON entity_tags(tag_id);

-- Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "User kann eigene Kommentare sehen" ON comments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Kommentare erstellen" ON comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User kann eigene Kommentare aktualisieren" ON comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Kommentare löschen" ON comments FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "User kann eigene Notizen sehen" ON notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Notizen erstellen" ON notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User kann eigene Notizen aktualisieren" ON notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Notizen löschen" ON notes FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "User kann eigene Tags sehen" ON tags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Tags erstellen" ON tags FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User kann eigene Tags aktualisieren" ON tags FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Tags löschen" ON tags FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "User kann eigene Entity-Tags sehen" ON entity_tags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User kann eigene Entity-Tags erstellen" ON entity_tags FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User kann eigene Entity-Tags löschen" ON entity_tags FOR DELETE USING (user_id = auth.uid());
