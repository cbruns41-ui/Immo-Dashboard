import { useState } from "react";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
import {
  TrendingUp,
  ArrowDown,
  Wallet,
  Trash2,
  Plus,
  Download,
} from "lucide-react";

export default function Finances() {
  const { houses, transactions, setTransactions } = useImmo();
  const { warning: notifyWarning, success: notifySuccess } = useNotifications();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");

  const selectedHouse = houses.find(h => String(h.id) === String(houseId));

  const addTransaction = async () => {
    if (!description.trim() || !amount) {
      notifyWarning("Beschreibung und Betrag sind Pflichtfelder.");
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

    const ok = await setTransactions([newTrans, ...transactions]);
    if (ok === false) return;

    notifySuccess("Buchung gespeichert");
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

  // Datev Export Function
  const exportDatev = () => {
    if (transactions.length === 0) {
      notifyWarning("Keine Transaktionen zum Exportieren vorhanden.");
      return;
    }

    // Datev CSV Format
    const headers = "Buchungstext;Betrag;Datum;Kontonummer;Buchungsschlüssel;Gegenkonto;Belegnummer;Steuerschlüssel\n";
    
    const csvContent = transactions.map(t => {
      const buchungstext = t.description || "";
      const betrag = t.amount.toFixed(2).replace('.', ',');
      const datum = t.date || "";
      const kontonummer = t.type === "income" ? "1000" : "6000"; // Beispielkonten
      const buchungsschluessel = "40"; // Standard Buchungsschlüssel
      const gegenkonto = t.type === "income" ? "8000" : "1200"; // Beispiel Gegenkonten
      const belegnummer = t.id || "";
      const steuerschluessel = t.type === "income" ? "3" : "19"; // MwSt Steuerschlüssel

      return `${buchungstext};${betrag};${datum};${kontonummer};${buchungsschluessel};${gegenkonto};${belegnummer};${steuerschluessel}`;
    }).join("\n");

    const fullCsv = headers + csvContent;
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `datev_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={page}>
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <Wallet size={32} />
            <h1 style={title}>Finanzen</h1>
          </div>
          <p style={subtitle}>Einnahmen & Ausgaben verwalten</p>
          <button 
            onClick={exportDatev}
            style={exportBtn}
          >
            <Download size={16} />
            DATEV Export
          </button>
        </div>

        {/* Neue Buchung Form */}
        <div style={card}>
          <h3 style={formTitle}>Neue Buchung eintragen</h3>

          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={input}
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
            style={input}
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
              style={input}
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
            style={input}
          />

          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Betrag in €"
            style={input}
          />

          <button
            onClick={addTransaction}
            style={primaryBtn}
          >
            <Plus size={18} style={{ marginRight: 8 }} />
            Buchung hinzufügen
          </button>
        </div>

        {/* Zusammenfassung */}
        <div style={summaryGrid}>
          <div style={summaryCardGreen}>
            <div style={summaryIcon}><TrendingUp size={24} /></div>
            <div style={summaryContent}>
              <div style={summaryLabel}>Einnahmen</div>
              <div style={summaryValueGreen}>{totalIncome.toFixed(2)} €</div>
            </div>
          </div>

          <div style={summaryCardRed}>
            <div style={summaryIcon}><ArrowDown size={24} /></div>
            <div style={summaryContent}>
              <div style={summaryLabel}>Ausgaben</div>
              <div style={summaryValueRed}>{totalExpense.toFixed(2)} €</div>
            </div>
          </div>

          <div style={{
            ...summaryCardGreen,
            background: balance >= 0 ? 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderColor: balance >= 0 ? '#86efac' : '#fca5a5'
          }}>
            <div style={{
              ...summaryIcon,
              background: balance >= 0 ? '#16a34a' : '#dc2626',
              color: 'white'
            }}>
              <Wallet size={24} />
            </div>
            <div style={summaryContent}>
              <div style={{
                ...summaryLabel,
                color: balance >= 0 ? '#166534' : '#dc2626'
              }}>Saldo</div>
              <div style={{
                ...summaryValueGreen,
                color: balance >= 0 ? '#166534' : '#dc2626'
              }}>{balance.toFixed(2)} €</div>
            </div>
          </div>
        </div>

        {/* Buchungen Liste */}
        <h3 style={listTitle}>
          Alle Buchungen ({transactions.length})
        </h3>

        {transactions.length === 0 ? (
          <div style={emptyState}>
            Noch keine Buchungen vorhanden.
          </div>
        ) : (
          transactions.map(t => (
            <div
              key={t.id}
              style={{
                ...transactionCard,
                borderLeft: `4px solid ${t.type === "income" ? "#16a34a" : "#ef4444"}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong style={transactionDate}>{t.date}</strong><br />
                  <span style={transactionDesc}>{t.description}</span>
                  {t.house_id && <small style={transactionMeta}>Haus: {t.house_id}</small>}
                  {t.apartment_id && <small style={transactionMeta}>Wohnung: {t.apartment_id}</small>}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{
                    ...transactionAmount,
                    color: t.type === "income" ? "#16a34a" : "#ef4444"
                  }}>
                    {t.type === "income" ? "+" : "-"}{Number(t.amount).toFixed(2)} €
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteTransaction(t.id)}
                style={deleteBtn}
              >
                <Trash2 size={14} style={{ marginRight: 6 }} />
                Löschen
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE – Gradient Design iOS/Android
========================= */
const page = {
  minHeight: "100vh",
  padding: "20px 16px 100px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a"
};

const container = {
  maxWidth: 1200,
  margin: "0 auto"
};

const header = {
  marginBottom: 32,
  textAlign: "center",
  position: "relative"
};

const exportBtn = {
  position: "absolute",
  right: 0,
  top: 0,
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  transition: "all 0.2s ease"
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 8,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
  fontWeight: 500
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 28,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  marginBottom: 24
};

const formTitle = {
  marginTop: 0,
  marginBottom: 24,
  color: "#1e293b",
  fontSize: 20,
  fontWeight: 700
};

const input = {
  width: "100%",
  padding: 16,
  marginBottom: 16,
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  fontSize: 16,
  fontWeight: 500,
  color: "#1e293b",
  background: "white",
  transition: "all 0.2s ease"
};

const primaryBtn = {
  width: "100%",
  padding: 18,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 16,
  fontSize: 17,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
  transition: "all 0.3s ease"
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginBottom: 32
};

const summaryCardGreen = {
  background: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
  padding: 24,
  borderRadius: 18,
  border: "2px solid #86efac",
  display: "flex",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 4px 16px rgba(22, 163, 74, 0.15)"
};

const summaryCardRed = {
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  padding: 24,
  borderRadius: 18,
  border: "2px solid #fca5a5",
  display: "flex",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 4px 16px rgba(239, 68, 68, 0.15)"
};

const summaryIcon = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  flexShrink: 0
};

const summaryContent = {
  flex: 1
};

const summaryLabel = {
  fontSize: 13,
  fontWeight: 700,
  color: "#166534",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 4
};

const summaryValueGreen = {
  fontSize: 28,
  fontWeight: 800,
  color: "#166534"
};

const summaryValueRed = {
  fontSize: 28,
  fontWeight: 800,
  color: "#dc2626"
};

const listTitle = {
  marginBottom: 20,
  color: "#1e293b",
  fontSize: 22,
  fontWeight: 700
};

const emptyState = {
  color: "#64748b",
  textAlign: "center",
  padding: 60,
  fontSize: 16,
  fontWeight: 500
};

const transactionCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  marginBottom: 16,
  borderRadius: 18,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
};

const transactionDate = {
  fontSize: 16,
  fontWeight: 700,
  color: "#1e293b"
};

const transactionDesc = {
  color: "#64748b",
  fontSize: 14
};

const transactionMeta = {
  display: "block",
  marginTop: 6,
  color: "#94a3b8",
  fontSize: 12
};

const transactionAmount = {
  fontSize: 24,
  fontWeight: 800
};

const deleteBtn = {
  marginTop: 16,
  padding: "10px 20px",
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  color: "#dc2626",
  border: "none",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease"
};