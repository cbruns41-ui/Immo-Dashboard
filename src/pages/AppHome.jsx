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
  Play,
} from "lucide-react";
import NewsFeed from "../components/NewsFeed";

/**
 * Öffentliche Startseite: App-Infos + Newsfeed.
 * Login/Demo führt danach zur App (App.jsx / Dashboard).
 */
export default function AppHome({ onLogin, onDemo }) {
  return (
    <div style={page}>
      <div style={heroWrap}>
        <div style={badge}>
          <Sparkles size={14} />
          <span>Neue Generation Immobilien-Software</span>
        </div>

        <h1 style={title}>ImmoForge</h1>

        <p style={subtitle}>
          Die moderne SaaS-Plattform für Vermieter, Cashflow und Immobilienverwaltung.
          Alles in einer App. Schnell. Klar. Mobil optimiert.
        </p>

        <div style={ctaRow}>
          <button type="button" style={primaryBtn} onClick={onDemo}>
            <Play size={16} />
            Demo starten
          </button>

          <button type="button" style={secondaryBtn} onClick={onLogin}>
            Login
            <ArrowRight size={16} />
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
            <span>Dokumenten-System</span>
          </div>
        </div>
      </div>

      <div style={newsSection}>
        <NewsFeed />
      </div>

      <div style={section}>
        <h2 style={sectionTitle}>Alles, was Vermieter brauchen</h2>
        <p style={sectionSubtitle}>
          Kein Tool-Chaos mehr. Alles zentral in einer Oberfläche.
        </p>

        <div style={grid}>
          <Feature
            icon={<Home />}
            title="Immobilien-Verwaltung"
            text="Verwalte Häuser, Einheiten und Mieter strukturiert."
          />
          <Feature
            icon={<BarChart3 />}
            title="Cashflow-Dashboard"
            text="Sieh sofort, wie profitabel deine Objekte sind."
          />
          <Feature
            icon={<FileText />}
            title="PDF-Generator"
            text="Mietverträge, Abrechnungen und Dokumente automatisch."
          />
          <Feature
            icon={<Cloud />}
            title="Cloud-Dokumente"
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

      <div style={ctaSection}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          Bereit, dein Immobilien-Setup zu modernisieren?
        </h2>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          Melde dich an oder teste die Demo ohne Registrierung.
        </p>
        <button type="button" style={ctaBig} onClick={onLogin}>
          Jetzt einloggen
          <ArrowRight size={18} />
        </button>
      </div>

      <div style={footer}>
        <span>ImmoForge © 2026</span>
        <span>Impressum · Datenschutz</span>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div style={card}>
      <div style={iconBox}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: "#64748b", fontSize: 14, fontWeight: 500 }}>
        {text}
      </p>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  padding: 24,
  paddingTop: "max(24px, env(safe-area-inset-top))",
  paddingBottom: "max(24px, env(safe-area-inset-bottom))",
  color: "#0f172a",
  boxSizing: "border-box",
};

const heroWrap = {
  maxWidth: 900,
  margin: "0 auto",
  textAlign: "center",
  paddingTop: 40,
  paddingBottom: 24,
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  borderRadius: 999,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  fontSize: 13,
  color: "#0f172a",
  marginBottom: 20,
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
};

const title = {
  fontSize: "clamp(36px, 8vw, 56px)",
  fontWeight: 900,
  letterSpacing: "-2px",
  margin: 0,
  background: "linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const subtitle = {
  fontSize: 18,
  color: "rgba(255, 255, 255, 0.9)",
  maxWidth: 600,
  margin: "16px auto 0",
  fontWeight: 500,
  lineHeight: 1.5,
};

const ctaRow = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  marginTop: 32,
  flexWrap: "wrap",
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "16px 24px",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  color: "#3b82f6",
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
};

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "16px 24px",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  fontWeight: 700,
  cursor: "pointer",
  color: "#0f172a",
};

const miniStats = {
  display: "flex",
  justifyContent: "center",
  gap: 14,
  marginTop: 36,
  flexWrap: "wrap",
};

const statBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 18px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 999,
  fontSize: 13,
  color: "#0f172a",
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
};

const newsSection = {
  maxWidth: 720,
  margin: "0 auto 32px",
};

const section = {
  maxWidth: 1100,
  margin: "0 auto",
  paddingTop: 20,
};

const sectionTitle = {
  textAlign: "center",
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const sectionSubtitle = {
  textAlign: "center",
  color: "rgba(255, 255, 255, 0.85)",
  marginBottom: 36,
  fontWeight: 500,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
};

const iconBox = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
};

const ctaSection = {
  maxWidth: 900,
  margin: "60px auto 40px",
  textAlign: "center",
  padding: 40,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 24,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
};

const ctaBig = {
  marginTop: 20,
  padding: "16px 28px",
  borderRadius: 16,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
};

const footer = {
  maxWidth: 900,
  margin: "20px auto",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  fontSize: 13,
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: 500,
};
