import { useState } from "react";
import { useImmo } from "../context/ImmoContext";
import { v4 as uuidv4 } from "uuid";

export default function Finances() {
  const { houses, transactions, setTransactions } = useImmo();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");

  const selectedHouse = houses.find(h => h.id === houseId);

  const addTransaction = () => {
    if (!description.trim() || !amount) {
      alert("Beschreibung und Betrag sind Pflichtfelder!");
      return;
    }

    const newTrans = {
      id: uuidv4(), // ✅ FIX: kein Date.now()

      date: new Date().toISOString().split("T")[0],
      description: description.trim(),
      amount: Number(amount),
      type,

      // ✅ FIX: Supabase kompatible Struktur
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
      <h2>💰 Finanzen</h2>

      <div style={{
        background: "white",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        marginBottom: 30
      }}>
        <h3>Neue Buchung</h3>

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{ width: "100%", padding: 14, marginBottom: 12, borderRadius: 8 }}
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
          style={{ width: "100%", padding: 14, marginBottom: 12, borderRadius: 8 }}
        >
          <option value="">Haus auswählen...</option>
          {houses.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        {/* ✅ WICHTIG: exakt wie vorher behalten */}
        {selectedHouse && (
          <select
            value={apartmentId}
            onChange={e => setApartmentId(e.target.value)}
            style={{ width: "100%", padding: 14, marginBottom: 20, borderRadius: 8 }}
          >
            <option value="">Wohnung auswählen (optional)...</option>
            {selectedHouse.apartments?.map(apt => (
              <option key={apt.id} value={apt.id}>
                {apt.name} – {apt.tenant}
              </option>
            ))}
          </select>
        )}

        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Beschreibung"
          style={{
            width: "100%",
            padding: 14,
            marginBottom: 12,
            borderRadius: 8
          }}
        />

        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Betrag €"
          style={{
            width: "100%",
            padding: 14,
            marginBottom: 20,
            borderRadius: 8
          }}
        />

        <button
          onClick={addTransaction}
          style={{
            padding: "14px 30px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 8,
            width: "100%",
            fontSize: 16
          }}
        >
          Buchung hinzufügen
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
        <div style={{
          background: "#d4edda",
          padding: 25,
          borderRadius: 12,
          flex: 1,
          textAlign: "center"
        }}>
          <strong>Einnahmen</strong><br />
          <span style={{ fontSize: "32px", color: "green" }}>
            {totalIncome.toFixed(2)} €
          </span>
        </div>

        <div style={{
          background: "#f8d7da",
          padding: 25,
          borderRadius: 12,
          flex: 1,
          textAlign: "center"
        }}>
          <strong>Ausgaben</strong><br />
          <span style={{ fontSize: "32px", color: "red" }}>
            {totalExpense.toFixed(2)} €
          </span>
        </div>

        <div style={{
          background: balance >= 0 ? "#d4edda" : "#f8d7da",
          padding: 25,
          borderRadius: 12,
          flex: 1,
          textAlign: "center"
        }}>
          <strong>Saldo</strong><br />
          <span style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: balance >= 0 ? "green" : "red"
          }}>
            {balance.toFixed(2)} €
          </span>
        </div>
      </div>

      <h3>Buchungen ({transactions.length})</h3>

      {transactions.length === 0 ? (
        <p style={{ color: "#666" }}>Noch keine Buchungen.</p>
      ) : (
        transactions.map(t => (
          <div
            key={t.id}
            style={{
              background: "white",
              padding: 18,
              marginBottom: 12,
              borderRadius: 10,
              borderLeft: `6px solid ${t.type === "income" ? "green" : "red"}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{t.date}</strong> — {t.description}<br />
                <small>
                  {t.house_id && `Haus ID: ${t.house_id}`}{" "}
                  {t.apartment_id && `– Wohnung ID: ${t.apartment_id}`}
                </small>
              </div>

              <div style={{
                fontWeight: "bold",
                color: t.type === "income" ? "green" : "red"
              }}>
                {t.type === "income" ? "+" : "-"}
                {Number(t.amount).toFixed(2)} €
              </div>
            </div>

            <button
              onClick={() => deleteTransaction(t.id)}
              style={{ marginTop: 8, color: "red" }}
            >
              Löschen
            </button>
          </div>
        ))
      )}
    </div>
  );
}