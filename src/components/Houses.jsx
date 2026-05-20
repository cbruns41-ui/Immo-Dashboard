import React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";
import {
  Home,
  Building2,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

export default function Houses() {
  const { houses, setHouses } = useImmo();

  // Haus Form
  const [houseName, setHouseName] = useState("");
  const [monthlyLoan, setMonthlyLoan] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [editHouseId, setEditHouseId] = useState(null);
  const [openCostsHouse, setOpenCostsHouse] = useState({});

  // Apartment Form
  const [editApartment, setEditApartment] = useState(null);
  const [newApartment, setNewApartment] = useState({
    name: "",
    tenant: "",
    tenant2: "",
    persons: "",
    kaltmiete: "",
    warmmiete: "",
    deposit: "",
    notes: "",
  });

  const addHouse = async () => {
    if (!houseName.trim()) return;

    const newHouseData = {
      id: editHouseId || uuidv4(),
      name: houseName,
      apartments: [],
      costs: JSON.parse(JSON.stringify(defaultCosts)),
      monthlyLoan: Number(monthlyLoan) || 0,
      interestRate: Number(interestRate) || 0,
    };

    let newHouses;
    if (editHouseId) {
      newHouses = houses.map((h) =>
        h.id === editHouseId ? { ...h, ...newHouseData } : h
      );
    } else {
      newHouses = [...houses, newHouseData];
    }

    await setHouses([...newHouses]);

    setHouseName("");
    setMonthlyLoan("");
    setInterestRate("");
    setEditHouseId(null);
  };

  const deleteHouse = async (id) => {
    if (!window.confirm("Haus und alle Wohnungen wirklich löschen?")) return;
    const newHouses = houses.filter((h) => h.id !== id);
    await setHouses([...newHouses]);
  };

  const startEditHouse = (house) => {
    setHouseName(house.name || "");
    setMonthlyLoan(house.monthlyLoan || "");
    setInterestRate(house.interestRate || "");
    setEditHouseId(house.id);
  };

  const addApartment = async (houseId) => {
    if (!newApartment.name.trim()) return;

    const apt = {
      id: uuidv4(),
      ...newApartment,
      kaltmiete: Number(newApartment.kaltmiete) || 0,
      warmmiete: Number(newApartment.warmmiete) || 0,
      deposit: Number(newApartment.deposit) || 0,
      persons: Number(newApartment.persons) || 1,
    };

    const newHouses = houses.map((h) => {
      if (h.id === houseId) {
        return {
          ...h,
          apartments: [...(h.apartments || []), apt],
        };
      }
      return h;
    });

    await setHouses([...newHouses]);

    setNewApartment({
      name: "",
      tenant: "",
      tenant2: "",
      persons: "",
      kaltmiete: "",
      warmmiete: "",
      deposit: "",
      notes: "",
    });
  };

  const deleteApartment = async (houseId, aptId) => {
    if (!window.confirm("Wohnung wirklich löschen?")) return;

    const newHouses = houses.map((h) => {
      if (h.id === houseId) {
        return {
          ...h,
          apartments: (h.apartments || []).filter((a) => a.id !== aptId),
        };
      }
      return h;
    });

    await setHouses([...newHouses]);
  };

  const startEditApartment = (houseId, apt) => {
    setEditApartment({ houseId, apt: { ...apt } });
  };

  const saveApartmentEdit = async () => {
    if (!editApartment) return;
    const newHouses = houses.map((h) => {
      if (h.id === editApartment.houseId) {
        return {
          ...h,
          apartments: h.apartments.map((a) =>
            a.id === editApartment.apt.id ? editApartment.apt : a
          ),
        };
      }
      return h;
    });
    await setHouses([...newHouses]);
    setEditApartment(null);
  };

  const updateCosts = async (houseId, costType, field, value) => {
    const newHouses = houses.map((h) => {
      if (h.id === houseId) {
        const updatedCosts = { ...h.costs };
        if (!updatedCosts[costType]) {
          updatedCosts[costType] = { month: 0, quarter: 0, year: 0 };
        }
        const numValue = Number(value) || 0;
        updatedCosts[costType][field] = numValue;

        if (field === "month") {
          updatedCosts[costType].quarter = numValue * 3;
          updatedCosts[costType].year = numValue * 12;
        } else if (field === "quarter") {
          updatedCosts[costType].month = numValue / 3;
          updatedCosts[costType].year = numValue * 4;
        } else if (field === "year") {
          updatedCosts[costType].month = numValue / 12;
          updatedCosts[costType].quarter = numValue / 3;
        }
        return { ...h, costs: updatedCosts };
      }
      return h;
    });
    await setHouses([...newHouses]);
  };

  const getTotalMonthlyCosts = (house) => {
    if (!house?.costs) return 0;
    return Object.values(house.costs).reduce(
      (sum, item) => sum + (Number(item?.month) || 0),
      0
    );
  };

  const getTotalYearlyCosts = (house) => {
    if (!house?.costs) return 0;
    return Object.values(house.costs).reduce(
      (sum, item) => sum + (Number(item?.year) || 0),
      0
    );
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <h1 style={title}>Häuser & Wohnungen</h1>
          <p style={subtitle}>Verwaltung deiner Objekte</p>
        </div>

        {/* Neues Haus hinzufügen */}
        <div style={card}>
          <h3 style={formTitle}>Neues Haus hinzufügen</h3>

          <input
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="Hausname / Adresse"
            style={input}
          />

          <div style={inputRow}>
            <input
              type="number"
              value={monthlyLoan}
              onChange={(e) => setMonthlyLoan(e.target.value)}
              placeholder="Monatliche Darlehensrate (€)"
              style={input}
            />
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Zinssatz (%)"
              style={input}
            />
          </div>

          <button onClick={addHouse} style={primaryBtn}>
            {editHouseId ? "Haus aktualisieren" : "Haus hinzufügen"}
          </button>
        </div>

        {/* Häuser Liste */}
        {houses.map((house) => (
          <div key={house.id} style={card}>
            <div style={houseHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Home size={28} />
                <h3 style={{ margin: 0 }}>{house.name}</h3>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEditHouse(house)} style={editBtn}>Bearbeiten</button>
                <button onClick={() => deleteHouse(house.id)} style={deleteBtn}>Löschen</button>
              </div>
            </div>

            {/* Darlehens-Info */}
            {(house.monthlyLoan > 0 || house.interestRate > 0) && (
              <div style={infoBox}>
                Darlehen: {house.monthlyLoan} € / Monat ({house.interestRate}% Zins)
              </div>
            )}

            {/* Wohnung hinzufügen */}
            <div style={{ marginTop: 30 }}>
              <h4>Wohnung hinzufügen</h4>

              <input
                value={newApartment.name}
                onChange={(e) => setNewApartment({ ...newApartment, name: e.target.value })}
                placeholder="Wohnungsname / Nummer"
                style={input}
              />

              <input
                value={newApartment.tenant}
                onChange={(e) => setNewApartment({ ...newApartment, tenant: e.target.value })}
                placeholder="Mieter 1"
                style={input}
              />

              <input
                value={newApartment.tenant2}
                onChange={(e) => setNewApartment({ ...newApartment, tenant2: e.target.value })}
                placeholder="Mieter 2 (optional)"
                style={input}
              />

              <div style={inputRow}>
                <input
                  type="number"
                  value={newApartment.kaltmiete}
                  onChange={(e) => setNewApartment({ ...newApartment, kaltmiete: e.target.value })}
                  placeholder="Kaltmiete"
                  style={input}
                />
                <input
                  type="number"
                  value={newApartment.warmmiete}
                  onChange={(e) => setNewApartment({ ...newApartment, warmmiete: e.target.value })}
                  placeholder="Warmmiete"
                  style={input}
                />
                <input
                  type="number"
                  value={newApartment.deposit}
                  onChange={(e) => setNewApartment({ ...newApartment, deposit: e.target.value })}
                  placeholder="Kaution"
                  style={input}
                />
              </div>

              <button onClick={() => addApartment(house.id)} style={primaryBtn}>
                Wohnung hinzufügen
              </button>
            </div>

            {/* Wohnungen anzeigen */}
            {(house.apartments || []).length > 0 && (
              <div style={{ marginTop: 30 }}>
                <h4>Wohnungen ({house.apartments.length})</h4>
                {house.apartments.map((apt) => (
                  <div key={apt.id} style={subCard}>
                    <strong>{apt.name}</strong> – {apt.tenant} {apt.tenant2 && `& ${apt.tenant2}`}
                    <div style={{ marginTop: 8, fontSize: 14 }}>
                      Kalt: {apt.kaltmiete} € | Warm: {apt.warmmiete} € | Kaution: {apt.deposit} €
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <button onClick={() => startEditApartment(house.id, apt)} style={editBtn}>Bearbeiten</button>
                      <button onClick={() => deleteApartment(house.id, apt.id)} style={deleteBtn}>Löschen</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nebenkosten */}
            <button
              onClick={() =>
                setOpenCostsHouse({
                  ...openCostsHouse,
                  [house.id]: !openCostsHouse[house.id],
                })
              }
              style={secondaryBtn}
            >
              Nebenkosten bearbeiten
            </button>

            {openCostsHouse[house.id] && (
              <div style={costsCard}>
                {/* ... Nebenkosten-Tabelle bleibt unverändert ... */}
                <h4>Nebenkosten für {house.name}</h4>
                <div style={costsGrid}>
                  <div>Kostenart</div>
                  <div>Monat</div>
                  <div>Quartal</div>
                  <div>Jahr</div>

                  {Object.keys(defaultCosts).map((key) => {
                    const cost = house.costs?.[key] || { month: 0, quarter: 0, year: 0 };
                    return (
                      <React.Fragment key={key}>
                        <div>{key}</div>
                        <input
                          type="number"
                          value={cost.month}
                          onChange={(e) => updateCosts(house.id, key, "month", e.target.value)}
                          style={smallInput}
                        />
                        <input
                          type="number"
                          value={cost.quarter}
                          onChange={(e) => updateCosts(house.id, key, "quarter", e.target.value)}
                          style={smallInput}
                        />
                        <input
                          type="number"
                          value={cost.year}
                          onChange={(e) => updateCosts(house.id, key, "year", e.target.value)}
                          style={smallInput}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>

                <div style={costsSummary}>
                  <div>
                    <span>Monatlich gesamt:</span>
                    <span>{getTotalMonthlyCosts(house).toFixed(2)} €</span>
                  </div>
                  <div>
                    <span>Jährlich gesamt:</span>
                    <span>{getTotalYearlyCosts(house).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE – exakt wie bei den anderen Seiten
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

const card = {
  background: "white",
  padding: 28,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  marginBottom: 32,
};

const formTitle = { marginTop: 0, marginBottom: 20, color: "#0f172a", fontSize: 20, fontWeight: 600 };

const input = {
  width: "100%",
  padding: 16,
  marginBottom: 16,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  background: "#f8fafc",
};

const inputRow = {
  display: "flex",
  gap: 16,
  marginBottom: 20,
};

const primaryBtn = {
  width: "100%",
  padding: 16,
  background: "#0A2540",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer",
};

const subCard = {
  background: "#f8f9fa",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
};

const houseHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const editBtn = {
  padding: "8px 16px",
  background: "#f1f5f9",
  border: "none",
  borderRadius: 10,
  marginRight: 8,
  fontSize: 14,
};

const deleteBtn = {
  padding: "8px 16px",
  background: "#fee2e2",
  color: "#ef4444",
  border: "none",
  borderRadius: 10,
  fontSize: 14,
};

const infoBox = {
  background: "#f8f9fa",
  padding: 16,
  borderRadius: 12,
  marginBottom: 24,
  fontSize: 15,
};

const secondaryBtn = {
  padding: "12px 24px",
  background: "#f1f5f9",
  color: "#0f172a",
  border: "none",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  width: "100%",
  marginTop: 10,
};

const costsCard = {
  background: "#f8f9fa",
  padding: 24,
  borderRadius: 16,
  marginTop: 16,
};

const costsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 80px 80px 80px",
  gap: 12,
  marginTop: 16,
  fontWeight: 600,
};

const smallInput = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #ddd",
  textAlign: "center",
  fontSize: 14,
};

const costsSummary = {
  marginTop: 24,
  padding: 16,
  background: "#0A2540",
  color: "white",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};