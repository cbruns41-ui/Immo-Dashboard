import { useImmo } from "../context/ImmoContext";

export default function Cashflow() {
  const { houses, transactions } = useImmo();

  // Einnahmen
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Ausgaben
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  // Mieteinnahmen (Warmmiete)
  const rentIncome = houses.reduce((sum, h) => {
    return (
      sum +
      (h.apartments || []).reduce(
        (aSum, a) => aSum + (Number(a.warmmiete) || 0),
        0
      )
    );
  }, 0);

  return (
    <div>
      <h2>📈 Cashflow</h2>

      {/* KPI BOXEN */}
      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: 25,
        }}
      >
        <h3>Übersicht</h3>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>Einnahmen</h4>
            <div style={{ fontSize: 28, color: "green" }}>
              {totalIncome.toFixed(2)} €
            </div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>Ausgaben</h4>
            <div style={{ fontSize: 28, color: "red" }}>
              {totalExpense.toFixed(2)} €
            </div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>Cashflow</h4>
            <div
              style={{
                fontSize: 28,
                color: balance >= 0 ? "green" : "red",
              }}
            >
              {balance.toFixed(2)} €
            </div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>Warmmiete (Soll)</h4>
            <div style={{ fontSize: 28, color: "#1e40af" }}>
              {rentIncome.toFixed(2)} €
            </div>
          </div>
        </div>
      </div>

      {/* LETZTE BUCHUNGEN */}
      <div
        style={{
          background: "white",
          padding: 25,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Letzte Buchungen</h3>

        {transactions.length === 0 ? (
          <p style={{ color: "#666" }}>Keine Buchungen vorhanden</p>
        ) : (
          transactions.slice(0, 10).map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{t.date}</strong> — {t.description}
              </div>

              <div
                style={{
                  fontWeight: "bold",
                  color: t.type === "income" ? "green" : "red",
                }}
              >
                {t.type === "income" ? "+" : "-"}
                {Number(t.amount).toFixed(2)} €
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}