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
    <div style={{ padding: "20px 15px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
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
          📈
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0A2540" }}>
            Cashflow
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            Einnahmen • Ausgaben • Übersicht
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {/* Einnahmen */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "20px", color: "#28a745" }}>💰</div>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#28a745", fontWeight: "700" }}>
            {totalIncome.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Einnahmen</p>
        </div>

        {/* Ausgaben */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "20px", color: "#dc3545" }}>📤</div>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#dc3545", fontWeight: "700" }}>
            {totalExpense.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Ausgaben</p>
        </div>

        {/* Cashflow */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "20px" }}>📊</div>
          <h1
            style={{
              fontSize: "48px",
              margin: "0 0 8px",
              color: balance >= 0 ? "#28a745" : "#dc3545",
              fontWeight: "700",
            }}
          >
            {balance.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Cashflow</p>
        </div>

        {/* Warmmiete Soll */}
        <div
          style={{
            background: "white",
            padding: "32px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "20px", color: "#0A2540" }}>🏠</div>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#0A2540", fontWeight: "700" }}>
            {rentIncome.toFixed(0)} €
          </h1>
          <p style={{ color: "#555", fontSize: "18px", fontWeight: "600" }}>Warmmiete (Soll)</p>
        </div>
      </div>

      {/* Letzte Buchungen */}
      <div
        style={{
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginBottom: "24px", color: "#0A2540", fontSize: "24px" }}>
          Letzte Buchungen
        </h3>

        {transactions.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "40px 0", fontSize: "17px" }}>
            Noch keine Buchungen vorhanden
          </p>
        ) : (
          transactions
            .slice(0, 10)
            .map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid #f1f1f1",
                }}
              >
                <div>
                  <strong style={{ color: "#333" }}>{t.date}</strong>
                  <span style={{ marginLeft: "12px", color: "#555" }}>
                    {t.description}
                  </span>
                </div>

                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "18px",
                    color: t.type === "income" ? "#28a745" : "#dc3545",
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