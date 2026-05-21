export default function Landing({ onLogin }) {
  return (
    <div style={page}>
      <div style={container}>

        {/* HERO */}
        <div style={hero}>
          <h1 style={title}>ImmoForge</h1>

          <p style={subtitle}>
            Moderne Immobilienverwaltung für Vermieter.
            Alles in einer App – Cashflow, Dokumente, Steuer & mehr.
          </p>

          <div style={buttonRow}>
            <button style={primaryBtn} onClick={onLogin}>
              Login / Starten
            </button>

            <button style={secondaryBtn}>
              Demo ansehen
            </button>
          </div>
        </div>

        {/* FEATURES */}
        <div style={grid}>
          <div style={card}>
            <h3>Cashflow Tracking</h3>
            <p>Einnahmen und Ausgaben automatisch verwalten.</p>
          </div>

          <div style={card}>
            <h3>Dokumente</h3>
            <p>Belege, Rechnungen und Mietverträge zentral speichern.</p>
          </div>

          <div style={card}>
            <h3>Steuer Export</h3>
            <p>DATEV / CSV Export für Steuerberater.</p>
          </div>

          <div style={card}>
            <h3>PDF Generator</h3>
            <p>Nebenkostenabrechnung & Verträge erstellen.</p>
          </div>
        </div>

        {/* NEWS / UPDATES */}
        <div style={newsSection}>
          <h2>Neu in ImmoForge</h2>

          <div style={newsList}>
            <div style={newsItem}>
              🚀 Cashflow Modul verbessert
            </div>

            <div style={newsItem}>
              📄 Dokumentenmanager mit Upload
            </div>

            <div style={newsItem}>
              📊 Steuer Export für 2026 hinzugefügt
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={footer}>
          <span>Impressum</span>
          <span>Datenschutz</span>
          <span>Kontakt</span>
        </div>

      </div>
    </div>
  );
}

/* =========================
   LAYOUT
========================= */

const page = {
  minHeight: "100vh",
  background: "#f6f7fb",
  display: "flex",
  justifyContent: "center",
  padding: 20,
  fontFamily: "Inter, Arial",
};

const container = {
  width: "100%",
  maxWidth: 1000,
};

/* =========================
   HERO
========================= */

const hero = {
  textAlign: "center",
  padding: "60px 20px",
};

const title = {
  fontSize: 56,
  fontWeight: 900,
  marginBottom: 10,
  letterSpacing: "-1px",
  color: "#0f172a",
};

const subtitle = {
  fontSize: 18,
  color: "#64748b",
  maxWidth: 600,
  margin: "0 auto 30px auto",
  lineHeight: 1.5,
};

const buttonRow = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  flexWrap: "wrap",
};

const primaryBtn = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
};

/* =========================
   FEATURES
========================= */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 40,
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

/* =========================
   NEWS
========================= */

const newsSection = {
  marginTop: 60,
  padding: 20,
  background: "white",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
};

const newsList = {
  marginTop: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const newsItem = {
  padding: 10,
  background: "#f8fafc",
  borderRadius: 10,
  fontSize: 14,
};

/* =========================
   FOOTER
========================= */

const footer = {
  marginTop: 60,
  display: "flex",
  justifyContent: "center",
  gap: 20,
  fontSize: 13,
  color: "#94a3b8",
};