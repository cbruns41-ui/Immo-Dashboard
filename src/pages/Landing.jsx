import {
  ArrowRight,
  BarChart3,
  FileText,
  Home,
  Shield,
  Sparkles,
  TrendingUp,
  Cloud,
  Database,
  Lock,
} from "lucide-react";

export default function Landing({ onLogin }) {
  return (
    <div style={page}>
      {/* HERO */}
      <div style={heroWrap}>
        <div style={badge}>
          <Sparkles size={14} />
          <span>Neue Generation Immobilien-Software</span>
        </div>

        <h1 style={title}>
          ImmoForge
        </h1>

        <p style={subtitle}>
          Die moderne SaaS Plattform für Vermieter, Cashflow & Immobilienverwaltung.
          Alles in einer App. Schnell. Klar. Mobil optimiert.
        </p>

        <div style={ctaRow}>
          <button style={primaryBtn} disabled>
            Demo starten
            <ArrowRight size={16} />
          </button>

          <button style={secondaryBtn}>
            Mehr erfahren
          </button>
        </div>

        <div style={miniStats}>
          <div style={statBox}>
            <TrendingUp size={16} />
            <span>Cashflow Tracking</span>
          </div>

          <div style={statBox}>
            <FileText size={16} />
            <span>PDF Generator</span>
          </div>

          <div style={statBox}>
            <Database size={16} />
            <span>Dokumenten System</span>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={section}>
        <h2 style={sectionTitle}>Alles was Vermieter brauchen</h2>
        <p style={sectionSubtitle}>
          Kein Tool-Chaos mehr. Alles zentral in einer Oberfläche.
        </p>

        <div style={grid}>
          <Feature
            icon={<Home />}
            title="Immobilien Verwaltung"
            text="Verwalte Häuser, Einheiten und Mieter strukturiert."
          />

          <Feature
            icon={<BarChart3 />}
            title="Cashflow Dashboard"
            text="Sieh sofort, wie profitabel deine Objekte sind."
          />

          <Feature
            icon={<FileText />}
            title="PDF Generator"
            text="Mietverträge, Abrechnungen und Dokumente automatisch."
          />

          <Feature
            icon={<Cloud />}
            title="Cloud Dokumente"
            text="Scans, Fotos und Dateien zentral gespeichert."
          />

          <Feature
            icon={<Shield />}
            title="Sichere Daten"
            text="Supabase Auth schützt deine gesamte Plattform."
          />

          <Feature
            icon={<Lock />}
            title="Zugriffskontrolle"
            text="Nur du siehst deine Daten – vollständig isoliert."
          />
        </div>
      </div>

      {/* CTA BOTTOM */}
      <div style={ctaSection}>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>
          Bereit dein Immobilien-Setup zu modernisieren?
        </h2>

        <p style={{ color: "#64748b", marginTop: 8 }}>
          Starte jetzt kostenlos und teste die komplette Plattform.
        </p>

        <button style={ctaBig} onClick={onLogin}>
          Jetzt starten
          <ArrowRight size={18} />
        </button>
      </div>

      {/* FOOTER */}
      <div style={footer}>
        <span>ImmoForge © 2026</span>
        <span>Impressum · Datenschutz</span>
      </div>
    </div>
  );
}

/* =========================
   FEATURE COMPONENT
========================= */

function Feature({ icon, title, text }) {
  return (
    <div style={card}>
      <div style={iconBox}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
        {text}
      </p>
    </div>
  );
}

/* =========================
   STYLES (SAAS MODERN)
========================= */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #eef2ff, #f6f7fb)",
  fontFamily: "Inter, Arial",
  padding: 24,
  color: "#0f172a",
};

const heroWrap = {
  maxWidth: 900,
  margin: "0 auto",
  textAlign: "center",
  paddingTop: 60,
  paddingBottom: 60,
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 999,
  background: "white",
  border: "1px solid #e2e8f0",
  fontSize: 12,
  color: "#475569",
  marginBottom: 16,
};

const title = {
  fontSize: 56,
  fontWeight: 900,
  letterSpacing: "-2px",
  margin: 0,
};

const subtitle = {
  fontSize: 18,
  color: "#64748b",
  maxWidth: 600,
  margin: "12px auto 0",
};

const ctaRow = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  marginTop: 28,
  flexWrap: "wrap",
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "14px 18px",
  borderRadius: 14,
  background: "#0f172a",
  color: "white",
  border: "none",
  fontWeight: 700,
  cursor: "not-allowed",
  opacity: 0.5,
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
};

const secondaryBtn = {
  padding: "14px 18px",
  borderRadius: 14,
  background: "white",
  border: "1px solid #e2e8f0",
  fontWeight: 600,
  cursor: "pointer",
};

const miniStats = {
  display: "flex",
  justifyContent: "center",
  gap: 14,
  marginTop: 30,
  flexWrap: "wrap",
};

const statBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 999,
  fontSize: 13,
  color: "#334155",
};

/* SECTION */

const section = {
  maxWidth: 1100,
  margin: "0 auto",
  paddingTop: 20,
};

const sectionTitle = {
  textAlign: "center",
  fontSize: 28,
  fontWeight: 800,
};

const sectionSubtitle = {
  textAlign: "center",
  color: "#64748b",
  marginBottom: 30,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const card = {
  background: "white",
  padding: 18,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const iconBox = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ctaSection = {
  maxWidth: 900,
  margin: "60px auto",
  textAlign: "center",
  padding: 30,
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
};

const ctaBig = {
  marginTop: 16,
  padding: "14px 22px",
  borderRadius: 14,
  background: "#0f172a",
  color: "white",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const footer = {
  maxWidth: 900,
  margin: "40px auto 10px",
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
  color: "#94a3b8",
};