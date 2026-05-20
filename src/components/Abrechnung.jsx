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
  FilePlus2,
  FileWarning,
  FileSignature,
  ClipboardList,
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

  const getBaseData = () => {
    if (!selectedHouse || !selectedApartment) return null;

    return {
      house: selectedHouse,
      apartment: selectedApartment,
      tenant: selectedApartment.tenant || "Unbekannt",
      period: `${periodStart} bis ${periodEnd}`,
    };
  };

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
    result.totalPaid =
      Math.round(nebenkostenVorauszahlung * months * 100) / 100;

    result.balance =
      Math.round((result.totalNebenkosten - result.totalPaid) * 100) / 100;

    return result;
  };

  const generateNebenkostenPDF = () => {
    const abrechnung = calculatePreciseAbrechnung();
    if (!abrechnung) return alert("Bitte Daten auswählen!");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("NEBENKOSTENABRECHNUNG", 105, 30, { align: "center" });

    doc.setFontSize(11);
    doc.text(`Mieter: ${abrechnung.tenant}`, 20, 60);
    doc.text(`Wohnung: ${abrechnung.apartment}`, 20, 70);
    doc.text(`Zeitraum: ${abrechnung.period}`, 20, 80);

    doc.save(`Nebenkosten_${abrechnung.tenant}.pdf`);
  };

  const generatePlaceholderPDF = (title) => {
    const base = getBaseData();
    if (!base) return alert("Bitte Haus & Wohnung auswählen!");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title.toUpperCase(), 105, 30, { align: "center" });

    doc.setFontSize(11);
    doc.text(`Mieter: ${base.tenant}`, 20, 60);
    doc.text(`Wohnung: ${base.apartment.name}`, 20, 70);
    doc.text(`Haus: ${base.house.name}`, 20, 80);
    doc.text(`Zeitraum: ${base.period}`, 20, 90);

    doc.save(`${title}_${base.tenant}.pdf`);
  };

  return (
    <div style={page}>
      <div style={container}>

        <div style={header}>
          <h1 style={title}>PDF Generator</h1>
          <p style={subtitle}>Verträge & Dokumente schnell erstellen</p>
        </div>

        {/* INPUT */}
        <div style={card}>
          <FileText size={26} />

          <div style={{ flex: 1 }}>
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

            <div style={grid}>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                style={input}
              />

              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                style={input}
              />
            </div>

            <div style={field}>
              <Percent size={18} />
              <input
                type="number"
                value={sharePercentage}
                onChange={(e) => setSharePercentage(Number(e.target.value))}
                style={input}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={gridActions}>

          <div style={actionCard}>
            <FilePlus2 />
            <div style={{ flex: 1 }}>
              <div style={actionTitle}>Nebenkostenabrechnung</div>
              <div style={actionDesc}>Automatisch berechnete Abrechnung</div>
            </div>

            <button style={downloadBtn} onClick={generateNebenkostenPDF}>
              <Download size={16} />
              Download
            </button>
          </div>

          <div style={actionCard}>
            <FileSignature />
            <div style={{ flex: 1 }}>
              <div style={actionTitle}>Mietvertrag</div>
              <div style={actionDesc}>Vertrag aus Daten generieren</div>
            </div>

            <button style={downloadBtn} onClick={() => generatePlaceholderPDF("Mietvertrag")}>
              <Download size={16} />
              Download
            </button>
          </div>

          <div style={actionCard}>
            <FileWarning />
            <div style={{ flex: 1 }}>
              <div style={actionTitle}>Mahnung</div>
              <div style={actionDesc}>Zahlungserinnerung erstellen</div>
            </div>

            <button style={downloadBtn} onClick={() => generatePlaceholderPDF("Mahnung")}>
              <Download size={16} />
              Download
            </button>
          </div>

          <div style={actionCard}>
            <ClipboardList />
            <div style={{ flex: 1 }}>
              <div style={actionTitle}>Übergabeprotokoll</div>
              <div style={actionDesc}>Wohnungsübergabe dokumentieren</div>
            </div>

            <button style={downloadBtn} onClick={() => generatePlaceholderPDF("Übergabeprotokoll")}>
              <Download size={16} />
              Download
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ========================= STYLE ========================= */

const page = {
  minHeight: "100vh",
  padding: "24px 16px",
  background: "#f6f7fb",
  fontFamily: "Inter, Arial",
};

const container = { maxWidth: 900, margin: "0 auto" };

const header = { textAlign: "center", marginBottom: 24 };

const title = { fontSize: 34, fontWeight: 800 };

const subtitle = { color: "#64748b" };

const card = {
  background: "white",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  display: "flex",
  gap: 16,
  marginBottom: 16,
};

const field = { display: "flex", gap: 10, marginBottom: 10, alignItems: "center" };

const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
};

const gridActions = { display: "grid", gap: 12 };

const actionCard = {
  background: "white",
  padding: 16,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const actionTitle = { fontWeight: 700 };

const actionDesc = { fontSize: 13, color: "#64748b" };

const downloadBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#0f172a",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};