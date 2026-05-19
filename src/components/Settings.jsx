import { useState, useEffect, useRef } from "react";
import { useImmo } from "../context/ImmoContext";
import { dataService } from "../services/dataService";
import {
  User,
  CreditCard,
  Shield,
  FileText
} from "lucide-react";

export default function Settings() {
  const { vermieter, setVermieter, user } = useImmo();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState("personal");

  const saveTimeout = useRef(null);
  const firstLoad = useRef(true);

  // =========================
  // INPUT CHANGE (UNVERÄNDERT)
  // =========================
  const handleChange = (e) => {
    setVermieter({
      ...vermieter,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // AUTOSAVE (UNVERÄNDERT)
  // =========================
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    if (!user?.id) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        setSaving(true);

        await dataService.saveVermieter(user.id, vermieter);

        setMessage("✅ Automatisch gespeichert");

        setTimeout(() => setMessage(""), 2500);
      } catch (error) {
        console.error(error);
        setMessage("❌ Fehler beim Speichern");

        setTimeout(() => setMessage(""), 4000);
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [vermieter, user, user?.id]);

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={headerCard}>
          <div style={iconCircle}>⚙️</div>

          <div style={{ width: "100%", textAlign: "center" }}>
            <h1 style={title}>Einstellungen</h1>
            <p style={subtitle}>Verwaltung & persönliche Daten</p>
          </div>
        </div>

        {/* NAV BUTTONS */}
        <div style={navGrid}>

          <button
            onClick={() => setActiveTab("personal")}
            style={{
              ...navBtn,
              ...(activeTab === "personal" ? navBtnActive : {})
            }}
          >
            <User size={18} />
            Persönliche Daten
          </button>

          <button style={navBtn}>
            <CreditCard size={18} />
            Bankdaten
          </button>

          <button style={navBtn}>
            <Shield size={18} />
            Sicherheit
          </button>

          <button style={navBtn}>
            <FileText size={18} />
            PDF Einstellungen
          </button>

        </div>

        {/* CONTENT */}
        <div style={contentCard}>

          {activeTab === "personal" && (
            <>
              <h3 style={sectionTitle}>
                Persönliche Daten (erscheinen in PDF-Abrechnungen)
              </h3>

              <input
                name="name"
                value={vermieter.name || ""}
                onChange={handleChange}
                placeholder="Vollständiger Name"
                style={input}
              />

              <input
                name="adresse"
                value={vermieter.adresse || ""}
                onChange={handleChange}
                placeholder="Straße + Hausnummer"
                style={input}
              />

              <div style={row}>
                <input
                  name="plz"
                  value={vermieter.plz || ""}
                  onChange={handleChange}
                  placeholder="PLZ"
                  style={{ ...input, flex: 1 }}
                />

                <input
                  name="ort"
                  value={vermieter.ort || ""}
                  onChange={handleChange}
                  placeholder="Ort"
                  style={{ ...input, flex: 2 }}
                />
              </div>

              <input
                name="telefon"
                value={vermieter.telefon || ""}
                onChange={handleChange}
                placeholder="Telefon"
                style={input}
              />

              <input
                name="email"
                value={vermieter.email || ""}
                onChange={handleChange}
                placeholder="E-Mail"
                style={input}
              />

              <h4 style={subTitle}>Bankdaten</h4>

              <input
                name="iban"
                value={vermieter.iban || ""}
                onChange={handleChange}
                placeholder="IBAN"
                style={input}
              />

              <input
                name="bic"
                value={vermieter.bic || ""}
                onChange={handleChange}
                placeholder="BIC"
                style={input}
              />

              <input
                name="bankname"
                value={vermieter.bankname || ""}
                onChange={handleChange}
                placeholder="Bankname"
                style={input}
              />
            </>
          )}

          {activeTab !== "personal" && (
            <div style={emptyState}>
              Dieser Bereich kommt bald 🚧
            </div>
          )}

          {/* STATUS */}
          <div style={statusBox}>
            {saving ? (
              <p style={statusText}>💾 Speichert...</p>
            ) : message ? (
              <p
                style={{
                  ...statusText,
                  color: message.includes("✅") ? "#0f172a" : "#dc2626"
                }}
              >
                {message}
              </p>
            ) : (
              <p style={{ color: "#64748b", fontSize: 13 }}>
                Änderungen werden automatisch gespeichert
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* =========================
   SAAS DASHBOARD STYLE
========================= */

const page = {
  minHeight: "100vh",
  padding: 24,
  background: "#f6f7fb",
  fontFamily: "Inter, Arial",
  color: "#0f172a",
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
};

const headerCard = {
  background: "white",
  padding: "28px 32px",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  marginBottom: 28,
  display: "flex",
  alignItems: "center",
  gap: 18,
};

const iconCircle = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
};

const title = {
  fontSize: 30,
  fontWeight: 800,
  margin: 0,
  textAlign: "center",
};

const subtitle = {
  margin: 0,
  color: "#64748b",
  textAlign: "center",
};

const navGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 28,
};

const navBtn = {
  padding: 16,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontWeight: 600,
  color: "#0f172a",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const navBtnActive = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #0f172a",
};

const contentCard = {
  background: "white",
  padding: 32,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const sectionTitle = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 22,
};

const subTitle = {
  marginTop: 20,
  marginBottom: 12,
  color: "#0f172a",
  fontWeight: 600,
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 16,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 15,
};

const row = {
  display: "flex",
  gap: 14,
  marginBottom: 10,
};

const statusBox = {
  marginTop: 18,
  textAlign: "center",
  minHeight: 28,
};

const statusText = {
  margin: 0,
  fontWeight: 600,
};

const emptyState = {
  textAlign: "center",
  color: "#64748b",
  padding: 30,
};