import { useState } from "react";
import { useImmo } from "../context/ImmoContext";

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
    <div style={{ padding: "20px 15px", maxWidth: "1280px", margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{
        background: "white",
        padding: "28px 32px",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "18px"
      }}>
        <div style={{
          width: "62px",
          height: "62px",
          background: "linear-gradient(135deg, #0A2540, #00D4C8)",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          boxShadow: "0 4px 15px rgba(0,212,200,0.3)"
        }}>📈</div>

        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0A2540" }}>
            Cashflow
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            Realistische Vermieter-Übersicht
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
      }}>

        <div style={{ background: "white", padding: "32px 24px", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "20px", color: "#00D4C8" }}>💰</div>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#00D4C8", fontWeight: "700" }}>
            {incomeWarmmiete.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Warmmiete (Brutto)</p>
        </div>

        <div style={{ background: "white", padding: "32px 24px", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "20px", color: "#1e88e5" }}>🏦</div>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#1e88e5", fontWeight: "700" }}>
            {incomeKaltmiete.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Kaltmiete (verfügbar)</p>
        </div>

        <div style={{ background: "white", padding: "32px 24px", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "20px", color: "#dc3545" }}>📤</div>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#dc3545", fontWeight: "700" }}>
            {(expenseLoan + totalRealCosts + manualExpense).toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Gesamtausgaben</p>
        </div>

        <div style={{ background: "white", padding: "32px 24px", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "20px" }}>📊</div>
          <h1 style={{
            fontSize: "48px",
            margin: "0 0 8px",
            color: cashflow >= 0 ? "#28a745" : "#dc3545",
            fontWeight: "700"
          }}>
            {cashflow.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Netto Cashflow</p>
        </div>
      </div>

      {/* Details Button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: "14px 32px",
            background: "#0A2540",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 6px 20px rgba(10, 37, 64, 0.25)"
          }}
        >
          {showDetails ? "Details ausblenden" : "Cashflow Details anzeigen"}
        </button>
      </div>

      {/* ====================== NEUE DETAIL-TABELLE ====================== */}
      {showDetails && (
        <div style={{
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginBottom: "25px", color: "#0A2540" }}>Cashflow Aufschlüsselung</h3>

          {/* Einnahmen */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ fontWeight: "700", color: "#28a745", fontSize: "18px", marginBottom: "12px" }}>EINNAHMEN</div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>Warmmiete (Brutto)</span>
              <span style={{ color: "#28a745", fontWeight: "600" }}>{incomeWarmmiete.toFixed(2)} €</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>Kaltmiete (verfügbar)</span>
              <span style={{ color: "#28a745", fontWeight: "600" }}>{incomeKaltmiete.toFixed(2)} €</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>Manuelle Einnahmen</span>
              <span style={{ color: "#28a745", fontWeight: "600" }}>{manualIncome.toFixed(2)} €</span>
            </div>
          </div>

          {/* Ausgaben */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ fontWeight: "700", color: "#dc3545", fontSize: "18px", marginBottom: "12px" }}>AUSGABEN</div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>Darlehensraten</span>
              <span style={{ color: "#dc3545", fontWeight: "600" }}>-{expenseLoan.toFixed(2)} €</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>Nebenkosten</span>
              <span style={{ color: "#dc3545", fontWeight: "600" }}>-{totalRealCosts.toFixed(2)} €</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>Manuelle Ausgaben</span>
              <span style={{ color: "#dc3545", fontWeight: "600" }}>-{manualExpense.toFixed(2)} €</span>
            </div>
          </div>

          {/* NETTO ERGEBNIS */}
          <div style={{
            borderTop: "2px solid #ddd",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            fontWeight: "700"
          }}>
            <span>NETTO CASHFLOW</span>
            <span style={{ color: cashflow >= 0 ? "#28a745" : "#dc3545", fontSize: "26px" }}>
              {cashflow.toFixed(2)} €
            </span>
          </div>
        </div>
      )}
    </div>
  );
}