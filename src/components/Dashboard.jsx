import { useImmo } from "../context/ImmoContext";

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
  // Jährliche Warmmiete (Vorauszahlung der Mieter)
  const totalWarmmieteYearly = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.warmmiete || 0) * 12,
        0
      )
    );
  }, 0);

  // Jährliche Kaltmiete (nur zur Info)
  const totalKaltmieteYearly = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.kaltmiete || 0) * 12,
        0
      )
    );
  }, 0);

  // Tatsächliche jährliche Nebenkosten (aus dem Reiter "Nebenkosten")
  const totalRealCostsYearly = safeHouses.reduce((sum, house) => {
    const costs = house.costs || {};
    return (
      sum +
      Object.values(costs).reduce((cSum, c) => cSum + (c.year || 0), 0)
    );
  }, 0);

  // Überschuss / Verlust (Jahresbasis)
  const difference = totalWarmmieteYearly - totalRealCostsYearly;

  return (
    <div style={{ padding: "20px 15px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Welcome Header */}
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
            boxShadow: "0 4px 15px rgba(0,212,200,0.3)",
          }}
        >
          👋
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0A2540" }}>
            Hallo {vermieter?.name ? vermieter.name.split(" ")[0] : "Vermieter"}!
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            Willkommen in deinem Immo Dashboard
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Häuser */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "24px" }}>🏠</div>
          <h1 style={{ fontSize: "58px", margin: "0 0 8px", color: "#0A2540", fontWeight: "700" }}>
            {totalHouses}
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Häuser</p>
        </div>

        {/* Wohnungen */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "24px" }}>🏢</div>
          <h1 style={{ fontSize: "58px", margin: "0 0 8px", color: "#0A2540", fontWeight: "700" }}>
            {totalApartments}
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Wohnungen</p>
        </div>

        {/* Warmmiete (jährlich) */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "24px", color: "#00D4C8" }}>💰</div>
          <h1 style={{ fontSize: "52px", margin: "0 0 8px", color: "#00D4C8", fontWeight: "700" }}>
            {totalWarmmieteYearly.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Warmmiete (VZ) jährlich</p>
        </div>

        {/* Kaltmiete (jährlich) */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "24px", color: "#1e88e5" }}>🏦</div>
          <h1 style={{ fontSize: "52px", margin: "0 0 8px", color: "#1e88e5", fontWeight: "700" }}>
            {totalKaltmieteYearly.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Kaltmiete gesamt (jährlich)</p>
        </div>

        {/* Überschuss / Verlust */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "24px" }}>📈</div>
          <h1
            style={{
              fontSize: "52px",
              margin: "0 0 8px",
              color: difference >= 0 ? "#28a745" : "#dc3545",
              fontWeight: "700",
            }}
          >
            {difference >= 0 ? "+" : ""}
            {difference.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>
            Überschuss / Verlust (Jahr)
          </p>
        </div>

        {/* Termine */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "24px" }}>📅</div>
          <h1 style={{ fontSize: "58px", margin: "0 0 8px", color: "#0A2540", fontWeight: "700" }}>
            {totalAppointments}
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Termine</p>
        </div>
      </div>
    </div>
  );
}