import { useImmo } from "../context/ImmoContext";
import {
  Home,
  Building2,
  TrendingUp,
  Banknote,
  ArrowUpRight,
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  const { houses, vermieter, appointments, transactions } = useImmo();

  const safeHouses = houses || [];
  const safeAppointments = appointments || [];
  const safeTransactions = transactions || [];

  const totalHouses = safeHouses.length;
  const totalApartments = safeHouses.reduce(
    (sum, h) => sum + (h.apartments?.length || 0),
    0
  );
  const totalAppointments = safeAppointments.length;

  // ====================== KORREKTE BERECHNUNG ======================
  const totalWarmmieteYearly = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.warmmiete || 0) * 12,
        0
      )
    );
  }, 0);

  const totalKaltmieteYearly = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.kaltmiete || 0) * 12,
        0
      )
    );
  }, 0);

  const totalRealCostsYearly = safeHouses.reduce((sum, house) => {
    const costs = house.costs || {};
    return (
      sum +
      Object.values(costs).reduce((cSum, c) => cSum + (c.year || 0), 0)
    );
  }, 0);

  const difference = totalWarmmieteYearly - totalRealCostsYearly;

  return (
    <div style={page}>
      <div style={container}>
        {/* Welcome Header */}
        <div style={header}>
          <h1 style={title}>
            Hallo {vermieter?.name ? vermieter.name.split(" ")[0] : "Vermieter"}!
          </h1>
          <p style={subtitle}>Willkommen in deinem ImmoForge Dashboard</p>
        </div>

        {/* KPI Cards Grid – EXAKT identisch mit Cashflow (perfekt mittig + gleiche Abstände) */}
        <div style={grid}>
          {/* Häuser */}
          <div style={card}>
            <div style={iconBox}>
              <Home size={28} />
            </div>
            <div>
              <div style={bigNumber}>{totalHouses}</div>
              <div style={label}>Häuser</div>
            </div>
          </div>

          {/* Wohnungen */}
          <div style={card}>
            <div style={iconBox}>
              <Building2 size={28} />
            </div>
            <div>
              <div style={bigNumber}>{totalApartments}</div>
              <div style={label}>Wohnungen</div>
            </div>
          </div>

          {/* Warmmiete jährlich */}
          <div style={card}>
            <div style={iconBox}>
              <TrendingUp size={28} />
            </div>
            <div>
              <div style={bigNumber}>{totalWarmmieteYearly.toFixed(0)} €</div>
              <div style={label}>Warmmiete (VZ) jährlich</div>
            </div>
          </div>

          {/* Kaltmiete jährlich */}
          <div style={card}>
            <div style={iconBox}>
              <Banknote size={28} />
            </div>
            <div>
              <div style={bigNumber}>{totalKaltmieteYearly.toFixed(0)} €</div>
              <div style={label}>Kaltmiete gesamt (jährlich)</div>
            </div>
          </div>

          {/* Überschuss / Verlust */}
          <div style={card}>
            <div style={iconBox}>
              <ArrowUpRight size={28} />
            </div>
            <div>
              <div style={{
                ...bigNumber,
                color: difference >= 0 ? "#16a34a" : "#dc2626"
              }}>
                {difference >= 0 ? "+" : ""}{difference.toFixed(0)} €
              </div>
              <div style={label}>Überschuss / Verlust (Jahr)</div>
            </div>
          </div>

          {/* Termine */}
          <div style={card}>
            <div style={iconBox}>
              <Calendar size={28} />
            </div>
            <div>
              <div style={bigNumber}>{totalAppointments}</div>
              <div style={label}>Termine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE – EXAKT identisch mit Cashflow.jsx (damit alles perfekt mittig ist)
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