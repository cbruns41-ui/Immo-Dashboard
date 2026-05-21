export default function Landing({
  onLogin,
}) {
  return (
    <div style={page}>
      <div style={heroGlow} />

      <div style={container}>
        {/* NAVBAR */}

        <div style={navbar}>
          <div>
            <div style={logo}>
              ImmoForge
            </div>

            <div style={logoSub}>
              SaaS für Vermieter
            </div>
          </div>

          <button
            style={loginBtn}
            onClick={onLogin}
          >
            Login
          </button>
        </div>

        {/* HERO */}

        <div style={hero}>
          <div style={badge}>
            Moderne Immobilienverwaltung
          </div>

          <h1 style={title}>
            Die moderne Plattform für
            Vermieter & Immobilienverwaltung
          </h1>

          <p style={subtitle}>
            Cashflow, Dokumente,
            Steuerexport, Nebenkosten,
            PDF Generator und mehr —
            alles in einer App.
          </p>

          <div style={heroButtons}>
            <button
              style={primaryBtn}
              onClick={onLogin}
            >
              Jetzt starten
            </button>

            <button style={secondaryBtn}>
              Demo ansehen
            </button>
          </div>
        </div>

        {/* FEATURES */}

        <div style={grid}>
          <div style={card}>
            <h3>Cashflow</h3>

            <p>
              Einnahmen, Ausgaben &
              Immobilienrendite im Blick.
            </p>
          </div>

          <div style={card}>
            <h3>Dokumente</h3>

            <p>
              Belege, PDFs und Scans
              automatisch organisieren.
            </p>
          </div>

          <div style={card}>
            <h3>DATEV Export</h3>

            <p>
              CSV Export für
              Steuerberater &
              Buchhaltung.
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div style={footer}>
          © 2026 ImmoForge · Impressum ·
          Datenschutz
        </div>
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",

  background:
    "linear-gradient(to bottom, #f8fafc, #eef2ff)",

  fontFamily: "Inter, Arial",

  position: "relative",

  overflow: "hidden",

  padding: 24,
};

const heroGlow = {
  position: "absolute",

  width: 700,
  height: 700,

  borderRadius: "50%",

  background:
    "rgba(99,102,241,0.12)",

  filter: "blur(80px)",

  top: -200,
  right: -200,
};

const container = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  position: "relative",
  zIndex: 2,
};

const navbar = {
  display: "flex",

  alignItems: "center",

  justifyContent: "space-between",

  marginBottom: 80,
};

const logo = {
  fontSize: 26,
  fontWeight: 900,
  color: "#0f172a",
};

const logoSub = {
  fontSize: 13,
  color: "#64748b",
};

const loginBtn = {
  padding: "12px 18px",

  borderRadius: 14,

  border: "1px solid #e2e8f0",

  background: "white",

  fontWeight: 700,

  cursor: "pointer",
};

const hero = {
  textAlign: "center",
  marginBottom: 80,
};

const badge = {
  display: "inline-flex",

  padding: "8px 14px",

  borderRadius: 999,

  background: "white",

  border: "1px solid #e2e8f0",

  fontSize: 13,

  fontWeight: 700,

  marginBottom: 20,
};

const title = {
  fontSize: "clamp(42px, 8vw, 82px)",

  lineHeight: 1,

  fontWeight: 900,

  letterSpacing: "-2px",

  color: "#020617",

  maxWidth: 950,

  margin: "0 auto 24px",
};

const subtitle = {
  fontSize: 20,

  color: "#64748b",

  maxWidth: 720,

  margin: "0 auto 30px",

  lineHeight: 1.6,
};

const heroButtons = {
  display: "flex",

  gap: 14,

  justifyContent: "center",

  flexWrap: "wrap",
};

const primaryBtn = {
  padding: "16px 24px",

  borderRadius: 16,

  border: "none",

  background: "#0f172a",

  color: "white",

  fontWeight: 800,

  cursor: "pointer",

  fontSize: 15,
};

const secondaryBtn = {
  padding: "16px 24px",

  borderRadius: 16,

  border: "1px solid #e2e8f0",

  background: "white",

  fontWeight: 800,

  cursor: "pointer",

  fontSize: 15,
};

const grid = {
  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",

  gap: 22,
};

const card = {
  background:
    "rgba(255,255,255,0.8)",

  backdropFilter: "blur(10px)",

  border: "1px solid #e2e8f0",

  borderRadius: 28,

  padding: 28,

  boxShadow:
    "0 10px 30px rgba(15,23,42,0.05)",
};

const footer = {
  marginTop: 80,

  textAlign: "center",

  color: "#94a3b8",

  fontSize: 13,
};