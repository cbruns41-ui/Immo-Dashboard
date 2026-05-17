import { useState, useEffect } from "react";
import { useImmo } from "../context/ImmoContext";
import { dataService } from "../services/dataService";

export default function Settings() {
  const { vermieter, setVermieter } = useImmo();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setVermieter({ ...vermieter, [e.target.name]: e.target.value });
  };

  const saveData = async () => {
    setSaving(true);
    setMessage("");

    try {
      await dataService.saveVermieter(vermieter);
      setMessage("✅ Alle Daten erfolgreich gespeichert!");
    } catch (error) {
      setMessage("❌ Fehler beim Speichern");
      console.error(error);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", background: "white", padding: 35, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      <h2>⚙️ Einstellungen</h2>
      <h3>Persönliche Daten (erscheinen in PDF-Abrechnungen)</h3>

      <input 
        name="name" 
        value={vermieter.name} 
        onChange={handleChange} 
        placeholder="Vollständiger Name" 
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }} 
      />
      <input 
        name="adresse" 
        value={vermieter.adresse} 
        onChange={handleChange} 
        placeholder="Straße + Hausnummer" 
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }} 
      />

      <div style={{ display: "flex", gap: 12 }}>
        <input 
          name="plz" 
          value={vermieter.plz} 
          onChange={handleChange} 
          placeholder="PLZ" 
          style={{ width: "30%", padding: 12, borderRadius: 6 }} 
        />
        <input 
          name="ort" 
          value={vermieter.ort} 
          onChange={handleChange} 
          placeholder="Ort" 
          style={{ width: "70%", padding: 12, borderRadius: 6 }} 
        />
      </div>

      <input 
        name="telefon" 
        value={vermieter.telefon} 
        onChange={handleChange} 
        placeholder="Telefon" 
        style={{ width: "100%", padding: 12, margin: "12px 0", borderRadius: 6 }} 
      />
      <input 
        name="email" 
        value={vermieter.email} 
        onChange={handleChange} 
        placeholder="E-Mail" 
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }} 
      />

      <h4>Bankdaten</h4>
      <input 
        name="iban" 
        value={vermieter.iban} 
        onChange={handleChange} 
        placeholder="IBAN" 
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }} 
      />
      <input 
        name="bic" 
        value={vermieter.bic} 
        onChange={handleChange} 
        placeholder="BIC" 
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }} 
      />
      <input 
        name="bankname" 
        value={vermieter.bankname} 
        onChange={handleChange} 
        placeholder="Bankname (optional)" 
        style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 6 }} 
      />

      <button 
        onClick={saveData} 
        disabled={saving}
        style={{ width: "100%", padding: "14px", background: saving ? "#6c757d" : "#007bff", color: "white", border: "none", borderRadius: 8, fontSize: "16px" }}
      >
        {saving ? "Wird gespeichert..." : "💾 Alle Daten speichern"}
      </button>

      {message && <p style={{ marginTop: 15, textAlign: "center", fontWeight: "bold", color: message.includes("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
}