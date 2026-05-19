import { useState } from "react";
import { useImmo } from "../context/ImmoContext";
import {
  TrendingUp,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function Cashflow() {
  const { houses, transactions } = useImmo();

  const [showDetails, setShowDetails] = useState(false);

  // =========================
  // EINNAHMEN
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

  // =========================
  // AUSGABEN
  // =========================
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

  // =========================
  // CASHFLOW
  // =========================
  const cashflow =
    incomeWarmmiete +
    incomeKaltmiete +
    manualIncome -
    expenseLoan -
    totalRealCosts -
    manualExpense;

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={header}>
          <h1 style={title}>Cashflow</h1>
          <p style={subtitle}>Realistische Vermieter-Übersicht</p>
        </div>

        {/* KPI CARDS */}
        <div style={grid}>
          <div style={card}>
            <div style={iconBox}>
              <TrendingUp size={28} />
            </div>
            <div>
              <div style={bigNumber}>{incomeWarmmiete.toFixed(0)} €</div>
              <div style={label}>Warmmiete (Brutto)</div>
            </div>
          </div>

          <div style={card}>
            <div style={iconBox}>
              <Banknote size={28} />
            </div>
            <div>
              <div style={bigNumber}>{incomeKaltmiete.toFixed(0)} €</div>
              <div style={label}>Kaltmiete (verfügbar)</div>
            </div>
          </div>

          <div style={card}>
            <div style={iconBox}>
              <ArrowDownRight size={28} />
            </div>
            <div>
              <div style={bigNumber}>{(expenseLoan + totalRealCosts + manualExpense).toFixed(0)} €</div>
              <div style={label}>Gesamtausgaben</div>
            </div>
          </div>

          <div style={card}>
            <div style={iconBox}>
              <ArrowUpRight size={28} />
            </div>
            <div>
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
        <div style={{ display: "flex", justifyContent: "center", margin: "40px 0" }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: "14px 32px",
              background: "#0A2540",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              boxShadow: "0 6px 20px rgba(10, 37, 64, 0.25)"
            }}
          >
            {showDetails ? "Details ausblenden" : "Cashflow Details anzeigen"}
          </button>
        </div>

        {/* DETAIL-TABELLE – genau wie gewünscht */}
        {showDetails && (
          <div style={card}>
            <h3 style={{ marginBottom: 24, color: "#0f172a" }}>Cashflow Aufschlüsselung</h3>

            {/* Einnahmen */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, color: "#16a34a", fontSize: 18, marginBottom: 12 }}>EINNAHMEN</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span>Warmmiete (Brutto)</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>{incomeWarmmiete.toFixed(2)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span>Kaltmiete (verfügbar)</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>{incomeKaltmiete.toFixed(2)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                <span>Manuelle Einnahmen</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>{manualIncome.toFixed(2)} €</span>
              </div>
            </div>

            {/* Ausgaben */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 18, marginBottom: 12 }}>AUSGABEN</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span>Darlehensraten</span>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>-{expenseLoan.toFixed(2)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span>Nebenkosten</span>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>-{totalRealCosts.toFixed(2)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                <span>Manuelle Ausgaben</span>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>-{manualExpense.toFixed(2)} €</span>
              </div>
            </div>

            {/* NETTO CASHFLOW */}
            <div style={{
              borderTop: "2px solid #0f172a",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 22,
              fontWeight: 700
            }}>
              <span>NETTO CASHFLOW</span>
              <span style={{ color: cashflow >= 0 ? "#16a34a" : "#dc2626", fontSize: 28 }}>
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
   SAAS STYLE (exakt wie in App.jsx)
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

const header = {
  marginBottom: 40,
  textAlign: "center",
};

const title = {
  fontSize: 34,
  fontWeight: 800,
  marginBottom: 4,
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const card = {
  background: "white",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const iconBox = {
  width: 56,
  height: 56,
  borderRadius: 12,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const bigNumber = {
  fontSize: 32,
  fontWeight: 700,
  color: "#0f172a",
  lineHeight: 1,
};

const label = {
  fontSize: 14,
  fontWeight: 500,
  color: "#64748b",
};