import { useImmo } from "../context/ImmoContext";

export default function Dashboard() {
  const { houses, vermieter, appointments, transactions } = useImmo();

  // 🔒 SAFE DEFAULTS (verhindert White Screen)
  const safeHouses = houses || [];
  const safeAppointments = appointments || [];
  const safeTransactions = transactions || [];

  const totalHouses = safeHouses.length;

  const totalApartments = safeHouses.reduce(
    (sum, h) => sum + (h.apartments?.length || 0),
    0
  );

  const totalAppointments = safeAppointments.length;

  // 💰 Warmmiete gesamt
  const totalWarmmiete = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.warmmiete || 0),
        0
      )
    );
  }, 0);

  // 💰 NEU: Kaltmiete gesamt
  const totalKaltmiete = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.kaltmiete || 0),
        0
      )
    );
  }, 0);

  // 🧾 echte Kosten
  const totalRealCosts = safeHouses.reduce((sum, house) => {
    const costs = house.costs || {};
    return (
      sum +
      Object.values(costs).reduce(
        (cSum, c) => cSum + (c.year || 0),
        0
      )
    );
  }, 0);

  // 📊 Überschuss / Verlust
  const difference = totalWarmmiete - totalRealCosts;

  // 💵 Einnahmen aus Transactions
  const totalIncome = safeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div>
      <h2>📊 Dashboard</h2>

      <div
        style={{
          background: "white",
          padding: 35,
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <h3>
          Hallo{" "}
          {vermieter?.name ? vermieter.name.split(" ")[0] : "Vermieter"} 👋
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              margin: "10px 0",
              color: "#1e3a8a",
            }}
          >
            {totalHouses}
          </h1>
          <h4>Häuser</h4>
        </div>

        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              margin: "10px 0",
              color: "#1e3a8a",
            }}
          >
            {totalApartments}
          </h1>
          <h4>Wohnungen</h4>
        </div>

        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#28a745",
            }}
          >
            {totalWarmmiete.toFixed(0)} €
          </h1>
          <h4>Warmmiete (VZ)</h4>
        </div>

        {/* 💙 NEU: Kaltmiete */}
        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#0d6efd",
            }}
          >
            {totalKaltmiete.toFixed(0)} €
          </h1>
          <h4>Kaltmiete gesamt</h4>
        </div>

        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: difference >= 0 ? "#28a745" : "#dc3545",
            }}
          >
            {difference.toFixed(0)} €
          </h1>
          <h4>Überschuss / Verlust</h4>
        </div>

        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              margin: "10px 0",
              color: "#28a745",
            }}
          >
            {totalAppointments}
          </h1>
          <h4>Termine</h4>
        </div>
      </div>
    </div>
  );
}