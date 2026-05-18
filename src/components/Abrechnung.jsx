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

  const selectedHouse = houses.find((h) => h.id === selectedHouseId);
  const selectedApartment = selectedHouse?.apartments?.find(
    (a) => a.id === selectedApartmentId
  );

  // =========================
  // ABRECHNUNG BERECHNEN (unverändert)
  // =========================
  const calculatePreciseAbrechnung = () => {
    if (!selectedApartment || !periodStart || !periodEnd) return null;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const months = days / 30.4375;

    const kaltmiete = Number(selectedApartment.kaltmiete) || 0;
    const nebenkostenVorauszahlung = Number(selectedApartment.warmmiete) || 0;

    const result = {
      tenant: selectedApartment.tenant || "Unbekannt",
      apartment: selectedApartment.name || "Wohnung",
      period: `${periodStart} bis ${periodEnd}`,
      days,
      months,
      kaltmiete,
      nebenkostenVorauszahlung,
      share: sharePercentage,
      costs: {},
    };

    const houseCosts = selectedHouse?.costs || defaultCosts;

    Object.keys(houseCosts).forEach((key) => {
      const yearly = Number(houseCosts[key]?.year) || 0;
      const daily = yearly / 365;
      const tenantCost = daily * days * (sharePercentage / 100);
      const paidShare = (yearly / 12) * months * (sharePercentage / 100);

      result.costs[key] = {
        yearly,
        actual: Math.round(tenantCost * 100) / 100,
        paid: Math.round(paidShare * 100) / 100,
        diff: Math.round((tenantCost - paidShare) * 100) / 100,
      };
    });

    const totalActual = Object.values(result.costs).reduce(
      (sum, c) => sum + c.actual,
      0
    );
    const totalPaidCosts = Object.values(result.costs).reduce(
      (sum, c) => sum + c.paid,
      0
    );

    result.totalNebenkosten = Math.round(totalActual * 100) / 100;
    result.totalPaidCosts = Math.round(totalPaidCosts * 100) / 100;
    result.totalPaid = Math.round(nebenkostenVorauszahlung * months * 100) / 100;
    result.balance = Math.round((result.totalNebenkosten - result.totalPaid) * 100) / 100;

    return result;
  };

  // =========================
  // PDF GENERIEREN (mit schöner Tabelle)
  // =========================
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
    doc.setTextColor(80, 80, 80);
    doc.text(vermieter.name || "Vermieter", 20, y);
    y += 5;
    doc.text(vermieter.adresse || "", 20, y);
    y += 5;
    doc.text(`${vermieter.plz || ""} ${vermieter.ort || ""}`, 20, y);
    y += 5;
    doc.text(vermieter.email || "", 20, y);
    y += 18;

    // Titel
    doc.setFontSize(18);
    doc.setTextColor(10, 37, 64);
    doc.text("NEBENKOSTENABRECHNUNG", 105, y, { align: "center" });
    y += 18;

    // Mieterdaten
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Mieter: ${abrechnung.tenant}`, 20, y);
    y += 7;
    doc.text(`Wohnung: ${abrechnung.apartment}`, 20, y);
    y += 7;
    doc.text(`Zeitraum: ${abrechnung.period} (${abrechnung.days} Tage)`, 20, y);
    y += 7;
    doc.text(`Mieteranteil: ${abrechnung.share}%`, 20, y);
    y += 15;

    // Tabelle Überschrift
    doc.setFontSize(12);
    doc.text("Nebenkosten-Detailvergleich", 20, y);
    y += 10;

    // Tabellen-Header
    doc.setFontSize(10);
    doc.text("Kostenart", 25, y);
    doc.text("Ist-Kosten", 105, y);
    doc.text("Vorauszahlung", 145, y);
    doc.text("Differenz", 185, y);
    y += 8;

    // Trennlinie
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 6;

    // Tabelle Inhalt
    Object.keys(abrechnung.costs).forEach((key) => {
      const c = abrechnung.costs[key];
      if (c.actual > 0 || c.paid > 0) {
        doc.text(key, 25, y);
        doc.text(c.actual.toFixed(2) + " €", 105, y);
        doc.text(c.paid.toFixed(2) + " €", 145, y);
        doc.text(c.diff.toFixed(2) + " €", 185, y);
        y += 7;
      }
    });

    y += 10;

    // Zusammenfassung
    doc.setFontSize(11);
    doc.text(`Gesamte Nebenkosten: ${abrechnung.totalNebenkosten.toFixed(2)} €`, 20, y);
    y += 8;
    doc.text(`Davon bereits gezahlt: ${abrechnung.totalPaid.toFixed(2)} €`, 20, y);
    y += 12;

    // Ergebnis (groß und farbig)
    doc.setFontSize(14);
    if (abrechnung.balance > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`Nachzahlung: ${abrechnung.balance.toFixed(2)} €`, 20, y);
    } else {
      doc.setTextColor(0, 140, 80);
      doc.text(`Guthaben: ${Math.abs(abrechnung.balance).toFixed(2)} €`, 20, y);
    }

    y += 18;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Diese Abrechnung wurde automatisch erstellt.", 20, y);
    y += 5;
    doc.text("Bitte prüfen und sorgfältig aufbewahren.", 20, y);

    doc.save(`Nebenkostenabrechnung_${abrechnung.tenant.replace(/ /g, "_")}.pdf`);
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

      {/* Form */}
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
          }}
        >
          📄 PDF erstellen & herunterladen
        </button>
      </div>
    </div>
  );
}