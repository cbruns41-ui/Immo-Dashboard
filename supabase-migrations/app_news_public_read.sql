-- Falls app_news.sql schon mit alter Policy ausgeführt wurde:
DROP POLICY IF EXISTS "Authenticated users can read news" ON app_news;

CREATE POLICY "Public can read news"
  ON app_news FOR SELECT TO anon, authenticated
  USING (true);
