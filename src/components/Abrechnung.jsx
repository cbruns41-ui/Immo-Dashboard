import { useState } from "react";
import jsPDF from "jspdf";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";

export default function Abrechnung() {
  const { houses, vermieter } = useImmo();

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [sharePercentage, setSharePercentage] = useState(100);

  // =========================
  // FIX: KEIN Number() mehr
  // =========================
  const selectedHouse = houses.find((h) => h.id === selectedHouseId);

  const selectedApartment = selectedHouse?.apartments?.find(
    (a) => a.id === selectedApartmentId
  );

  const calculatePreciseAbrechnung = () => {
    if (!selectedApartment || !periodStart || !periodEnd) return null;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const result = {
      tenant: selectedApartment.tenant,
      apartment: selectedApartment.name,
      period: `${periodStart} bis ${periodEnd}`,
      days,
      kaltmiete: selectedApartment.kaltmiete || 0,
      warmmiete:
        selectedApartment.warmmiete || selectedApartment.kaltmiete * 1.2,
      share: sharePercentage,
      costs: {},
    };

    const houseCosts = selectedHouse?.costs || defaultCosts;

    Object.keys(houseCosts).forEach((key) => {
      const yearly = houseCosts[key].year || 0;
      const daily = yearly / 365;

      result.costs[key] = {
        total: Math.round(daily * days * (sharePercentage / 100) * 100) / 100,
      };
    });

    const totalNebenkosten = Object.values(result.costs).reduce(
      (sum, c) => sum + c.total,
      0
    );

    result.totalNebenkosten = Math.round(totalNebenkosten * 100) / 100;
    result.gesamtmiete = Math.round((result.warmmiete + totalNebenkosten) * 100) / 100;

    return result;
  };

  const generatePDF = () => {
    const abrechnung = calculatePreciseAbrechnung();
    if (!abrechnung) {
      alert("Bitte Haus, Wohnung und Zeitraum auswählen!");
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    // Briefkopf
    doc.setFontSize(10);
    doc.text(vermieter.name || "Vermieter", 20, y);
    y += 5;
    doc.text(vermieter.adresse || "", 20, y);
    y += 5;
    doc.text(`${vermieter.plz || ""} ${vermieter.ort || ""}`, 20, y);
    y += 5;
    doc.text(vermieter.email || "", 20, y);
    y += 15;

    doc.setFontSize(18);
    doc.text("NEBENKOSTENABRECHNUNG", 105, y, { align: "center" });
    y += 20;

    doc.setFontSize(12);
    doc.text(`Mieter: ${abrechnung.tenant}`, 20, y);
    y += 8;
    doc.text(`Wohnung: ${abrechnung.apartment}`, 20, y);
    y += 8;
    doc.text(`Zeitraum: ${abrechnung.period} (${abrechnung.days} Tage)`, 20, y);
    y += 15;

    doc.text(`Kaltmiete: ${abrechnung.kaltmiete} €`, 20, y);
    y += 10;
    doc.text(`Mieteranteil: ${abrechnung.share}%`, 20, y);
    y += 15;

    doc.text("Verteilte Nebenkosten:", 20, y);
    y += 10;

    Object.keys(abrechnung.costs).forEach((key) => {
      if (abrechnung.costs[key].total > 0) {
        doc.text(`• ${key}: ${abrechnung.costs[key].total} €`, 25, y);
        y += 9;
      }
    });

    y += 10;
    doc.setFontSize(14);
    doc.text(`Summe Nebenkosten: ${abrechnung.totalNebenkosten} €`, 20, y);
    y += 12;
    doc.text(`Gesamtmiete für den Zeitraum: ${abrechnung.gesamtmiete} €`, 20, y);

    doc.save(`Abrechnung_${abrechnung.tenant.replace(/ /g, "_")}.pdf`);
  };

  return (
    <div style={{ padding: "20px 15px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "28px 32px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
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
            background: "linear-gradient(135deg, #0A2540, #00D4C8)",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
          }}
        >
          📋
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0A2540" }}>
            Nebenkostenabrechnung
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            Professionelle PDF-Abrechnung erstellen
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        style={{
          background: "white",
          padding: "40px 35px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginBottom: "28px", color: "#0A2540", fontSize: "24px" }}>
          Abrechnung erstellen
        </h3>

        <select
          value={selectedHouseId}
          onChange={(e) => {
            setSelectedHouseId(e.target.value);
            setSelectedApartmentId("");
          }}
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
          }}
        >
          <option value="">Haus auswählen...</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        {selectedHouse && (
          <select
            value={selectedApartmentId}
            onChange={(e) => setSelectedApartmentId(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "28px",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              fontSize: "16px",
            }}
          >
            <option value="">Wohnung auswählen...</option>
            {selectedHouse.apartments?.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.name} – {apt.tenant}
              </option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", gap: "20px", marginBottom: "28px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#444" }}>
              Von
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#444" }}>
              Bis
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
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

        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#444" }}>
            Mieteranteil (%)
          </label>
          <input
            type="number"
            value={sharePercentage}
            onChange={(e) => setSharePercentage(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              fontSize: "16px",
            }}
          />
        </div>

        <button
          onClick={generatePDF}
          style={{
            width: "100%",
            padding: "18px",
            background: "linear-gradient(135deg, #0A2540, #00D4C8)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "18px",
            fontWeight: "600",
            boxShadow: "0 6px 20px rgba(10, 37, 64, 0.3)",
            transition: "all 0.3s ease",
          }}
        >
          📄 PDF Abrechnung erstellen & herunterladen
        </button>
      </div>
    </div>
  );
}