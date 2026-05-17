import { useImmo } from "../context/ImmoContext";

export default function Dashboard() {
  const { houses, vermieter, appointments, transactions } = useImmo();

  const totalHouses = houses.length;
  const totalApartments = houses.reduce((sum, h) => sum + (h.apartments?.length || 0), 0);
  const totalAppointments = appointments.length;

  // Gesamte Warmmiete (Vorauszahlung)
  const totalWarmmiete = houses.reduce((sum, house) => {
    return sum + (house.apartments || []).reduce((aptSum, apt) => aptSum + (apt.warmmiete || 0), 0);
  }, 0);

  // Gesamte tatsächliche Nebenkosten (aus dem Reiter Nebenkosten)
  const totalRealCosts = houses.reduce((sum, house) => {
    const costs = house.costs || {};
    return sum + Object.values(costs).reduce((cSum, c) => cSum + (c.year || 0), 0);
  }, 0);

  const difference = totalWarmmiete - totalRealCosts;   // positiv = Überschuss, negativ = Verlust

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div>
      <h2>📊 Dashboard</h2>

      <div style={{ background: "white", padding: 35, borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.1)", marginBottom: 30 }}>
        <h3>Hallo {vermieter?.name ? vermieter.name.split(" ")[0] : "Vermieter"} 👋</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h1 style={{ fontSize: "52px", margin: "10px 0", color: "#1e3a8a" }}>{totalHouses}</h1>
          <h4>Häuser</h4>
        </div>

        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h1 style={{ fontSize: "52px", margin: "10px 0", color: "#1e3a8a" }}>{totalApartments}</h1>
          <h4>Wohnungen</h4>
        </div>

        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h1 style={{ fontSize: "42px", margin: "10px 0", color: "#28a745" }}>{totalWarmmiete.toFixed(0)} €</h1>
          <h4>Warmmiete (VZ)</h4>
        </div>

        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h1 style={{ fontSize: "42px", margin: "10px 0", color: difference >= 0 ? "#28a745" : "#dc3545" }}>
            {difference.toFixed(0)} €
          </h1>
          <h4>Überschuss / Verlust</h4>
        </div>

        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h1 style={{ fontSize: "52px", margin: "10px 0", color: "#28a745" }}>{totalAppointments}</h1>
          <h4>Termine</h4>
        </div>
      </div>
    </div>
  );
}