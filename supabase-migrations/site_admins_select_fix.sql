-- Falls app_news.sql schon ausgeführt wurde – Admin-Check in der App reparieren:
DROP POLICY IF EXISTS "Admins can read site_admins" ON site_admins;

CREATE POLICY "User can check own admin status"
  ON site_admins FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));
