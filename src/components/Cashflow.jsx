import { useState } from "react";
import { useImmo } from "../context/ImmoContext";
import {
  TrendingUp,
  Banknote,
  ArrowDownRight,
  ArrowUpRight,
  Download,
} from "lucide-react";

export default function Cashflow() {
  const { houses, transactions } = useImmo();

  const [showDetails, setShowDetails] = useState(false);

  // =========================
  // BERECHNUNGEN
  // =========================
  const incomeWarmmiete = houses.reduce((sum, house) => {
    return sum + (house.apartments || []).reduce((aptSum, apt) =>
      aptSum + (Number(apt.warmmiete) || 0) * 12, 0);
  }, 0);

  const incomeKaltmiete = houses.reduce((sum, house) => {
    return sum + (house.apartments || []).reduce((aptSum, apt) =>
      aptSum + (Number(apt.kaltmiete) || 0) * 12, 0);
  }, 0);

  const manualIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const expenseLoan = houses.reduce((sum, house) => {
    return sum + (Number(house.monthlyLoan) || 0) * 12;
  }, 0);

  const totalRealCosts = houses.reduce((sum, house) => {
    const costs = house.costs || {};
    return sum + Object.values(costs).reduce((cSum, c) => cSum + (c.year || 0), 0);
  }, 0);

  const manualExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const cashflow =
    incomeWarmmiete +
    incomeKaltmiete +
    manualIncome -
    expenseLoan -
    totalRealCosts -
    manualExpense;

  // =========================
  // CSV EXPORT
  // =========================
  const exportToCSV = () => {
    const data = [
      ["Kategorie", "Betrag (€)", "Typ"],
      ["Warmmiete (jährlich)", incomeWarmmiete.toFixed(2), "Einnahme"],
      ["Kaltmiete (jährlich)", incomeKaltmiete.toFixed(2), "Einnahme"],
      ["Manuelle Einnahmen", manualIncome.toFixed(2), "Einnahme"],
      ["Darlehen (jährlich)", expenseLoan.toFixed(2), "Ausgabe"],
      ["Nebenkosten (jährlich)", totalRealCosts.toFixed(2), "Ausgabe"],
      ["Manuelle Ausgaben", manualExpense.toFixed(2), "Ausgabe"],
      ["CASHFLOW", cashflow.toFixed(2), "Gesamt"]
    ];

    const csvContent = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cashflow_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h1 style={title}>Cashflow</h1>
            <p style={subtitle}>Realistische Vermieter-Übersicht</p>
          </div>
          <button onClick={exportToCSV} style={exportBtn}>
            <Download size={20} />
            CSV Export
          </button>
        </div>

        {/* KPI CARDS */}
        <div style={grid}>
          <div style={kpiCard}>
            <div style={iconBox}><TrendingUp size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{incomeWarmmiete.toFixed(0)} €</div>
              <div style={label}>Warmmiete (Brutto)</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><Banknote size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{incomeKaltmiete.toFixed(0)} €</div>
              <div style={label}>Kaltmiete (verfügbar)</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><ArrowDownRight size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{(expenseLoan + totalRealCosts + manualExpense).toFixed(0)} €</div>
              <div style={label}>Gesamtausgaben</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><ArrowUpRight size={28} /></div>
            <div style={kpiContent}>
              <div style={{
                ...bigNumber,
                color: cashflow >= 0 ? "#16a34a" : "#dc2626"
              }}>
                {cashflow.toFixed(0)} €
              </div>
              <div style={label}>Netto Cashflow</div>
            </div>
          </div>
        </div>

        {/* Details Button */}
        <div style={{ display: "flex", justifyContent: "center", margin: "40px 0 20px" }}>
          <button onClick={() => setShowDetails(!showDetails)} style={detailsBtn}>
            {showDetails ? "Details ausblenden" : "Cashflow Details anzeigen"}
          </button>
        </div>

        {/* DETAIL-TABELLE – jetzt mobil-optimiert */}
        {showDetails && (
          <div style={card}>
            <h3 style={{ marginBottom: 24, color: "#0f172a" }}>Cashflow Aufschlüsselung</h3>

            {/* Einnahmen */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, color: "#16a34a", fontSize: 18, marginBottom: 12 }}>EINNAHMEN</div>
              <div style={detailRow}><span>Warmmiete (Brutto)</span><span style={green}>{incomeWarmmiete.toFixed(2)} €</span></div>
              <div style={detailRow}><span>Kaltmiete (verfügbar)</span><span style={green}>{incomeKaltmiete.toFixed(2)} €</span></div>
              <div style={detailRow}><span>Manuelle Einnahmen</span><span style={green}>{manualIncome.toFixed(2)} €</span></div>
            </div>

            {/* Ausgaben */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 18, marginBottom: 12 }}>AUSGABEN</div>
              <div style={detailRow}><span>Darlehensraten</span><span style={red}>-{expenseLoan.toFixed(2)} €</span></div>
              <div style={detailRow}><span>Nebenkosten</span><span style={red}>-{totalRealCosts.toFixed(2)} €</span></div>
              <div style={detailRow}><span>Manuelle Ausgaben</span><span style={red}>-{manualExpense.toFixed(2)} €</span></div>
            </div>

            {/* NETTO CASHFLOW */}
            <div style={nettoRow}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>NETTO CASHFLOW</span>
              <span style={{
                fontSize: 28,
                fontWeight: 700,
                color: cashflow >= 0 ? "#16a34a" : "#dc2626"
              }}>
                {cashflow.toFixed(2)} €
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE – Gradient Design iOS/Android
========================= */
const page = {
  minHeight: "100vh",
  padding: "20px 16px 100px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a"
};

const container = {
  maxWidth: 1200,
  margin: "0 auto"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 32
};

const exportBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 20px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 8,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
  fontWeight: 500
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16
};

const kpiCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  transition: "all 0.3s ease"
};

const iconBox = {
  width: 56,
  height: 56,
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "white",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
};

const kpiContent = {
  flex: 1
};

const bigNumber = {
  fontSize: 28,
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1
};

const label = {
  fontSize: 13,
  fontWeight: 600,
  color: "#64748b",
  marginTop: 4,
  textTransform: "uppercase",
  letterSpacing: 0.5
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 28,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "14px 0",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 16
};

const green = {
  color: "#16a34a",
  fontWeight: 600
};

const red = {
  color: "#dc2626",
  fontWeight: 600
};

const nettoRow = {
  borderTop: "2px solid #3b82f6",
  paddingTop: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 22,
  fontWeight: 700
};

const detailsBtn = {
  padding: "14px 32px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 700,
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  cursor: "pointer",
  transition: "all 0.3s ease"
};