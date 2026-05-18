
import { useState, useEffect, useRef } from "react";
import { useImmo } from "../context/ImmoContext";
import { dataService } from "../services/dataService";

export default function Settings() {
  const { vermieter, setVermieter, user } = useImmo();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // AUTOSAVE TIMER
  // =========================
  const saveTimeout = useRef(null);
  const firstLoad = useRef(true);

  // =========================
  // INPUT ÄNDERUNG
  // =========================
  const handleChange = (e) => {
    setVermieter({
      ...vermieter,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // AUTOSAVE
  // =========================
  useEffect(() => {
    // Erstes Laden ignorieren
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    // Kein User
    if (!user?.id) return;

    // Timeout löschen
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Neue Speicherung starten
    saveTimeout.current = setTimeout(async () => {
      try {
        setSaving(true);

        await dataService.saveVermieter(
          user.id,
          vermieter
        );

        setMessage("✅ Automatisch gespeichert");

        setTimeout(() => {
          setMessage("");
        }, 2500);
      } catch (error) {
        console.error(error);

        setMessage("❌ Fehler beim Speichern");

        setTimeout(() => {
          setMessage("");
        }, 4000);
      } finally {
        setSaving(false);
      }
    }, 800);

    // Cleanup
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [vermieter, user, user?.id]);

  return (
    <div
      style={{
        padding: "20px 15px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "28px 32px",
          borderRadius: "20px",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.1)",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "62px",
            height: "62px",
            background:
              "linear-gradient(135deg, #0A2540, #00D4C8)",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            boxShadow:
              "0 4px 15px rgba(0,212,200,0.3)",
          }}
        >
          ⚙️
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0A2540",
            }}
          >
            Einstellungen
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "18px",
            }}
          >
            Persönliche Daten &amp; Bankverbindung
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div
        style={{
          background: "white",
          padding: "40px 35px",
          borderRadius: "20px",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h3
          style={{
            marginBottom: "28px",
            color: "#0A2540",
            fontSize: "24px",
          }}
        >
          Persönliche Daten (erscheinen in PDF-Abrechnungen)
        </h3>

        <input
          name="name"
          value={vermieter.name || ""}
          onChange={handleChange}
          placeholder="Vollständiger Name"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        <input
          name="adresse"
          value={vermieter.adresse || ""}
          onChange={handleChange}
          placeholder="Straße + Hausnummer"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              name="plz"
              value={vermieter.plz || ""}
              onChange={handleChange}
              placeholder="PLZ"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ flex: 2 }}>
            <input
              name="ort"
              value={vermieter.ort || ""}
              onChange={handleChange}
              placeholder="Ort"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                fontSize: "16px",
              }}
            />
          </div>
        </div>

        <input
          name="telefon"
          value={vermieter.telefon || ""}
          onChange={handleChange}
          placeholder="Telefon"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        <input
          name="email"
          value={vermieter.email || ""}
          onChange={handleChange}
          placeholder="E-Mail"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "32px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        <h4
          style={{
            marginBottom: "20px",
            color: "#0A2540",
            fontSize: "20px",
          }}
        >
          Bankdaten
        </h4>

        <input
          name="iban"
          value={vermieter.iban || ""}
          onChange={handleChange}
          placeholder="IBAN"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        <input
          name="bic"
          value={vermieter.bic || ""}
          onChange={handleChange}
          placeholder="BIC"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        <input
          name="bankname"
          value={vermieter.bankname || ""}
          onChange={handleChange}
          placeholder="Bankname (optional)"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "10px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        />

        {/* Status */}
        <div
          style={{
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          {saving ? (
            <p
              style={{
                margin: 0,
                color: "#666",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              💾 Speichert...
            </p>
          ) : message ? (
            <p
              style={{
                margin: 0,
                color: message.includes("✅")
                  ? "#28a745"
                  : "#dc3545",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              {message}
            </p>
          ) : (
            <p
              style={{
                margin: 0,
                color: "#999",
                fontSize: "14px",
              }}
            >
              Änderungen werden automatisch gespeichert
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
