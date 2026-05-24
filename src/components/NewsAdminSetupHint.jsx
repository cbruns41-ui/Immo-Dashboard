import { Megaphone, Copy } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NewsAdminSetupHint({ userEmail }) {
  const { info } = useNotifications();

  const sql = userEmail
    ? `INSERT INTO site_admins (email) VALUES ('${userEmail}');`
    : `INSERT INTO site_admins (email) VALUES ('deine@login-email.de');`;

  const copySql = () => {
    navigator.clipboard?.writeText(sql);
    info("SQL in Zwischenablage kopiert");
  };

  return (
    <div>
      <h3 style={title}>
        <Megaphone size={20} />
        Newsfeed – Admin einrichten
      </h3>
      <p style={text}>
        Der Tab ist sichtbar, aber dein Account hat noch keine Admin-Rechte zum
        Veröffentlichen von News.
      </p>

      {userEmail && (
        <p style={text}>
          <strong>Eingeloggt als:</strong> {userEmail}
        </p>
      )}

      <ol style={list}>
        <li>
          Im Supabase SQL-Editor zuerst <code>supabase-migrations/app_news.sql</code>{" "}
          ausführen (Tabellen anlegen).
        </li>
        <li>
          Danach <code>app_news_public_read.sql</code> (öffentliches Lesen für die
          Startseite).
        </li>
        <li>Deine E-Mail als Admin eintragen (SQL unten).</li>
        <li>
          Optional in der Projekt-<code>.env</code>:{" "}
          <code>VITE_ADMIN_EMAIL={userEmail || "deine@email.de"}</code> und Dev-Server
          neu starten.
        </li>
      </ol>

      <div style={sqlBox}>
        <pre style={pre}>{sql}</pre>
        <button type="button" onClick={copySql} style={copyBtn}>
          <Copy size={16} />
          SQL kopieren
        </button>
      </div>

      <p style={hint}>
        Nach dem SQL-Befehl Seite neu laden – dann kannst du hier News erstellen.
      </p>
    </div>
  );
}

const title = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 12,
};

const text = {
  fontSize: 14,
  color: "#475569",
  lineHeight: 1.55,
  marginBottom: 12,
};

const list = {
  fontSize: 14,
  color: "#475569",
  lineHeight: 1.7,
  paddingLeft: 20,
  marginBottom: 16,
};

const sqlBox = {
  background: "#0f172a",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};

const pre = {
  margin: "0 0 12px",
  color: "#e2e8f0",
  fontSize: 13,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

const copyBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};

const hint = {
  fontSize: 13,
  color: "#64748b",
  margin: 0,
};
