import { useState } from "react";
import jsPDF from "jspdf";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";
import {
  FileText,
  Home,
  Calendar,
  Percent,
  Download,
} from "lucide-react";

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
  // ABRECHNUNG (UNVERÄNDERT)
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
    result.balance =
      Math.round((result.totalNebenkosten - result.totalPaid) * 100) / 100;

    return result;
  };

  // =========================
  // PDF (UNVERÄNDERT)
  // =========================
  const generatePDF = () => {
    const abrechnung = calculatePreciseAbrechnung();
    if (!abrechnung) {
      alert("Bitte Haus, Wohnung und Zeitraum auswählen!");
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(vermieter.name || "Vermieter", 20, y);
    y += 5;
    doc.text(vermieter.adresse || "", 20, y);
    y += 5;
    doc.text(`${vermieter.plz || ""} ${vermieter.ort || ""}`, 20, y);
    y += 5;
    doc.text(vermieter.email || "", 20, y);
    y += 20;

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("NEBENKOSTENABRECHNUNG", 105, y, { align: "center" });
    y += 25;

    doc.setFontSize(11);
    doc.text(`Mieter: ${abrechnung.tenant}`, 20, y);
    y += 7;
    doc.text(`Wohnung: ${abrechnung.apartment}`, 20, y);
    y += 7;
    doc.text(`Zeitraum: ${abrechnung.period}`, 20, y);
    y += 15;

    doc.save(`Abrechnung_${abrechnung.tenant}.pdf`);
  };

  // =========================
  // UI HELPERS (Dashboard Style)
  // =========================
  const Card = ({ children }) => (
    <div style={card}>{children}</div>
  );

  const InputCard = ({ children }) => (
    <div style={inputCard}>{children}</div>
  );

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <h1 style={title}>
            Nebenkostenabrechnung
          </h1>

          <p style={subtitle}>
            SaaS Abrechnungssystem für Vermieter
          </p>
        </div>

        {/* FORM CARD – perfekt zentriert und app-optimiert */}
        <Card>
          <div style={iconWrap}>
            <FileText size={26} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={sectionTitle}>Abrechnung erstellen</h2>

            {/* HOUSE */}
            <div style={field}>
              <Home size={18} />
              <select
                value={selectedHouseId}
                onChange={(e) => {
                  setSelectedHouseId(e.target.value);
                  setSelectedApartmentId("");
                }}
                style={input}
              >
                <option value="">Haus auswählen</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* APARTMENT */}
            {selectedHouse && (
              <div style={field}>
                <Home size={18} />
                <select
                  value={selectedApartmentId}
                  onChange={(e) => setSelectedApartmentId(e.target.value)}
                  style={input}
                >
                  <option value="">Wohnung auswählen</option>
                  {selectedHouse.apartments?.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* DATE */}
            <div style={grid}>
              <div style={field}>
                <Calendar size={18} />
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <Calendar size={18} />
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  style={input}
                />
              </div>
            </div>

            {/* SHARE */}
            <div style={field}>
              <Percent size={18} />
              <input
                type="number"
                value={sharePercentage}
                onChange={(e) => setSharePercentage(Number(e.target.value))}
                style={input}
              />
            </div>

            {/* BUTTON – jetzt schwarz, kein Floating, vollflächig und app-freundlich */}
            <button onClick={generatePDF} style={btn}>
              <Download size={18} />
              PDF erstellen
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD-STYLE DESIGN SYSTEM – optimiert für App-Darstellung (iOS PWA + Mobile)
========================= */

const page = {
  minHeight: "100vh",
  padding: "24px 16px",           // optimiert für Mobile / iOS App
  background: "#f6f7fb",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#0f172a",
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
};

const header = {
  marginBottom: 60,
  textAlign: "center",
};

const title = {
  fontSize: 34,
  fontWeight: 800,
  marginBottom: 6,
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
};

const card = {
  background: "white",
  padding: 26,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "flex",
  gap: 20,
  alignItems: "flex-start",
  width: "100%",           // volle Breite auf Mobile
  maxWidth: "520px",       // schöne Breite auf allen Geräten
  margin: "0 auto",        // perfekt zentriert
};

const iconWrap = {
  width: 56,
  height: 56,
  borderRadius: 12,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const sectionTitle = {
  margin: "0 0 18px 0",
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a",
};

const field = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const input = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  background: "white",
};

const btn = {
  width: "100%",
  padding: 16,
  borderRadius: 14,
  border: "none",
  background: "#0f172a",           // jetzt schwarz (wie gewünscht)
  color: "white",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  gap: 8,
  alignItems: "center",
  marginTop: 8,
};