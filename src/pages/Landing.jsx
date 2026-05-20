export default function Landing({ onLogin }) {
  return (
    <div style={page}>
      <div style={container}>

        <h1 style={title}>ImmoForge</h1>
        <p style={subtitle}>
          Moderne Immobilienverwaltung für Vermieter
        </p>

        <div style={card}>
          <h2>Alles in einer App</h2>
          <p>
            Häuser, Cashflow, Dokumente, Steuerexport und PDF Generator.
          </p>

          <button style={btn} onClick={onLogin}>
            Login / Starten
          </button>
        </div>

        <div style={footer}>
          Impressum · Datenschutz
        </div>

      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f6f7fb",
  fontFamily: "Arial",
};

const container = {
  maxWidth: 500,
  textAlign: "center",
};

const title = {
  fontSize: 48,
  fontWeight: 900,
};

const subtitle = {
  color: "#64748b",
  marginBottom: 30,
};

const card = {
  background: "white",
  padding: 30,
  borderRadius: 20,
  border: "1px solid #e2e8f0",
};

const btn = {
  marginTop: 20,
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const footer = {
  marginTop: 20,
  fontSize: 12,
  color: "#94a3b8",
};