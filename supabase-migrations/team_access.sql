-- ============================================
-- TEAM-ZUGRIFF (User Roles & Permissions)
-- ============================================

-- Tabelle für Team-Rollen
CREATE TABLE IF NOT EXISTS team_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standard-Rollen einfügen
INSERT INTO team_roles (name, description, permissions) VALUES
('owner', 'Vollzugriff auf alles', '{"all": true}'),
('admin', 'Administrativer Zugriff', '{"houses": true, "finances": true, "documents": true}'),
('viewer', 'Nur Lesezugriff', '{"read": true}'),
('bookkeeper', 'Finanz-Zugriff', '{"finances": true, "read": true}')
ON CONFLICT (name) DO NOTHING;

-- Tabelle für Team-Mitglieder
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role_id UUID REFERENCES team_roles(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  UNIQUE(user_id, team_id)
);

-- Tabelle für Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- Row Level Security (RLS)
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Team-Rollen sind öffentlich lesbar" ON team_roles FOR SELECT USING (true);
CREATE POLICY "Nur Owner kann Teams erstellen" ON teams FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Nur Team-Mitglieder können Team sehen" ON teams FOR SELECT USING (
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR owner_id = auth.uid()
);
CREATE POLICY "Nur Owner kann Team aktualisieren" ON teams FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Nur Owner kann Team löschen" ON teams FOR DELETE USING (owner_id = auth.uid());
