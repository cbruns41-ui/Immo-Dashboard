import { useState } from "react";
import { useImmo } from "../context/ImmoContext";

export default function Finances() {
  const { houses, transactions, setTransactions } = useImmo();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");

  const selectedHouse = houses.find(h => String(h.id) === String(houseId));

  const addTransaction = () => {
    if (!description.trim() || !amount) {
      alert("Beschreibung und Betrag sind Pflichtfelder!");
      return;
    }

    const newTrans = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      description: description.trim(),
      amount: Number(amount),
      type,
      house_id: houseId || null,
      apartment_id: apartmentId || null,
    };

    setTransactions([newTrans, ...transactions]);

    setDescription("");
    setAmount("");
    setHouseId("");
    setApartmentId("");
  };

  const deleteTransaction = (id) => {
    if (window.confirm("Buchung wirklich löschen?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div>
      <h2 style={{ marginBottom: "25px", color: "#0A2540", fontSize: "28px" }}>
        💰 Finanzen
      </h2>

      {/* Neue Buchung Form */}
      <div
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          marginBottom: "40px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "24px", color: "#0A2540" }}>
          Neue Buchung eintragen
        </h3>

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
            background: "#f8fafc"
          }}
        >
          <option value="income">Einnahme (+)</option>
          <option value="expense">Ausgabe (-)</option>
        </select>

        <select
          value={houseId}
          onChange={e => {
            setHouseId(e.target.value);
            setApartmentId("");
          }}
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
            background: "#f8fafc"
          }}
        >
          <option value="">Haus auswählen...</option>
          {houses.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        {selectedHouse && selectedHouse.apartments && selectedHouse.apartments.length > 0 && (
          <select
            value={apartmentId}
            onChange={e => setApartmentId(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "24px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              fontSize: "16px",
              background: "#f8fafc"
            }}
          >
            <option value="">Wohnung auswählen (optional)...</option>
            {selectedHouse.apartments.map(apt => (
              <option key={apt.id} value={apt.id}>
                {apt.name} – {apt.tenant}
              </option>
            ))}
          </select>
        )}

        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Beschreibung der Buchung"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            fontSize: "16px"
          }}
        />

        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Betrag in €"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            fontSize: "16px"
          }}
        />

        <button
          onClick={addTransaction}
          style={{
            padding: "16px 32px",
            background: "#0A2540",
            color: "white",
            border: "none",
            borderRadius: "14px",
            width: "100%",
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Buchung hinzufügen
        </button>
      </div>

      {/* Zusammenfassung */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={{ background: "#d4edda", padding: "28px 24px", borderRadius: "18px", textAlign: "center" }}>
          <div style={{ fontSize: "42px", marginBottom: "8px" }}>📥</div>
          <strong style={{ fontSize: "18px", color: "#166534" }}>Einnahmen</strong><br />
          <span style={{ fontSize: "38px", fontWeight: "700", color: "#166534" }}>
            {totalIncome.toFixed(2)} €
          </span>
        </div>

        <div style={{ background: "#fee2e2", padding: "28px 24px", borderRadius: "18px", textAlign: "center" }}>
          <div style={{ fontSize: "42px", marginBottom: "8px" }}>📤</div>
          <strong style={{ fontSize: "18px", color: "#b91c1c" }}>Ausgaben</strong><br />
          <span style={{ fontSize: "38px", fontWeight: "700", color: "#b91c1c" }}>
            {totalExpense.toFixed(2)} €
          </span>
        </div>

        <div style={{ 
          background: balance >= 0 ? "#d4edda" : "#fee2e2", 
          padding: "28px 24px", 
          borderRadius: "18px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "42px", marginBottom: "8px" }}>📊</div>
          <strong style={{ fontSize: "18px", color: balance >= 0 ? "#166534" : "#b91c1c" }}>Saldo</strong><br />
          <span style={{ 
            fontSize: "38px", 
            fontWeight: "700", 
            color: balance >= 0 ? "#166534" : "#b91c1c" 
          }}>
            {balance.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Buchungen Liste */}
      <h3 style={{ marginBottom: "20px", color: "#0A2540" }}>
        Alle Buchungen ({transactions.length})
      </h3>

      {transactions.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: "40px 0" }}>
          Noch keine Buchungen vorhanden.
        </p>
      ) : (
        transactions.map(t => (
          <div
            key={t.id}
            style={{
              background: "white",
              padding: "24px",
              marginBottom: "16px",
              borderRadius: "18px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              borderLeft: `6px solid ${t.type === "income" ? "#16a34a" : "#ef4444"}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong>{t.date}</strong><br />
                <span style={{ color: "#555" }}>{t.description}</span>
                {t.house_id && <small style={{ display: "block", marginTop: "6px" }}>Haus: {t.house_id}</small>}
                {t.apartment_id && <small>Wohnung: {t.apartment_id}</small>}
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ 
                  fontSize: "24px", 
                  fontWeight: "700", 
                  color: t.type === "income" ? "#16a34a" : "#ef4444" 
                }}>
                  {t.type === "income" ? "+" : "-"}{Number(t.amount).toFixed(2)} €
                </span>
              </div>
            </div>

            <button
              onClick={() => deleteTransaction(t.id)}
              style={{
                marginTop: "16px",
                padding: "8px 20px",
                background: "#fee2e2",
                color: "#ef4444",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px"
              }}
            >
              Löschen
            </button>
          </div>
        ))
      )}
    </div>
  );
}