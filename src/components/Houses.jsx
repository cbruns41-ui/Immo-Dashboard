import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";

export default function Houses() {
  const { houses, setHouses } = useImmo();

  const [houseName, setHouseName] = useState("");
  const [editHouseId, setEditHouseId] = useState(null);
  const [openCostsHouse, setOpenCostsHouse] = useState({});

  // NEU: Apartment Edit State
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

    let newHouses;

    if (editHouseId) {
      newHouses = houses.map((h) =>
        h.id === editHouseId
          ? {
              ...h,
              name: houseName,
            }
          : h
      );
    } else {
      newHouses = [
        ...houses,
        {
          id: uuidv4(),
          name: houseName,
          apartments: [],
          costs: JSON.parse(JSON.stringify(defaultCosts)),
        },
      ];
    }

    await setHouses(newHouses);

    setHouseName("");
    setEditHouseId(null);
  };

  const deleteHouse = async (id) => {
    if (!window.confirm("Haus und alle Wohnungen wirklich löschen?")) return;

    const newHouses = houses.filter((h) => h.id !== id);

    await setHouses(newHouses);
  };

  // NEU: Haus bearbeiten starten
  const startEditHouse = (house) => {
    setHouseName(house.name);
    setEditHouseId(house.id);
  };

  const cancelEditHouse = () => {
    setHouseName("");
    setEditHouseId(null);
  };

  const toggleCosts = (id) => {
    setOpenCostsHouse((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateCosts = async (houseId, field, type, value) => {
    const val = Number(value) || 0;

    const newHouses = houses.map((h) => {
      if (h.id !== houseId) return h;

      const costs = { ...h.costs };

      if (type === "month") {
        costs[field] = {
          month: val,
          quarter: Math.round(val * 3),
          year: Math.round(val * 12),
        };
      }

      if (type === "quarter") {
        costs[field] = {
          month: Math.round(val / 3),
          quarter: val,
          year: Math.round(val * 4),
        };
      }

      if (type === "year") {
        costs[field] = {
          month: Math.round(val / 12),
          quarter: Math.round(val / 4),
          year: val,
        };
      }

      return {
        ...h,
        costs,
      };
    });

    await setHouses(newHouses);
  };

  const addApartment = async (houseId) => {
    if (
      !newApartment.name ||
      !newApartment.tenant ||
      !newApartment.kaltmiete
    ) {
      return;
    }

    const apt = {
      id: uuidv4(),
      name: newApartment.name,
      tenant: newApartment.tenant,
      tenant2: newApartment.tenant2 || "",
      persons: Number(newApartment.persons) || 1,
      kaltmiete: Number(newApartment.kaltmiete),
      warmmiete: Number(
        newApartment.warmmiete ||
          Number(newApartment.kaltmiete) * 1.2
      ),
      deposit: Number(newApartment.deposit) || 0,
      notes: newApartment.notes || "",
    };

    const newHouses = houses.map((h) => {
      if (h.id !== houseId) return h;

      return {
        ...h,
        apartments: [...(h.apartments || []), apt],
      };
    });

    await setHouses(newHouses);

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
      if (h.id !== houseId) return h;

      return {
        ...h,
        apartments: h.apartments.filter((a) => a.id !== aptId),
      };
    });

    await setHouses(newHouses);
  };

  // NEU: Apartment speichern
  const saveApartmentEdit = async () => {
    const { houseId, apt } = editApartment;

    const newHouses = houses.map((h) => {
      if (h.id !== houseId) return h;

      return {
        ...h,
        apartments: h.apartments.map((a) =>
          a.id === apt.id
            ? {
                ...apt,
                persons: Number(apt.persons) || 1,
                kaltmiete: Number(apt.kaltmiete) || 0,
                warmmiete: Number(apt.warmmiete) || 0,
                deposit: Number(apt.deposit) || 0,
              }
            : a
        ),
      };
    });

    await setHouses(newHouses);
    setEditApartment(null);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "25px", color: "#0A2540", fontSize: "28px" }}>
        🏠 Häuser & Wohnungen
      </h2>

      {/* Haus hinzufügen */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          marginBottom: "35px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          placeholder="Neuer Hausname"
          style={{
            flex: 1,
            minWidth: "280px",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
          }}
        />

        <button
          onClick={addHouse}
          style={{
            padding: "14px 28px",
            background: "#0A2540",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          + Haus hinzufügen
        </button>

        {editHouseId && (
          <button
            onClick={cancelEditHouse}
            style={{
              padding: "14px 28px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Abbrechen
          </button>
        )}
      </div>

      {/* Häuser-Liste */}
      {houses.map((house) => (
        <div
          key={house.id}
          style={{
            background: "white",
            padding: "28px",
            marginBottom: "30px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "24px", color: "#0A2540" }}>{house.name}</h3>

            <div>
              <button
                onClick={() => startEditHouse(house)}
                style={{
                  padding: "10px 18px",
                  marginRight: "10px",
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                }}
              >
                Bearbeiten
              </button>
              <button
                onClick={() => deleteHouse(house.id)}
                style={{
                  padding: "10px 18px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                }}
              >
                Haus löschen
              </button>
            </div>
          </div>

          {/* Nebenkosten */}
          <button
            onClick={() => toggleCosts(house.id)}
            style={{
              marginBottom: "20px",
              padding: "12px 24px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Nebenkosten bearbeiten {openCostsHouse[house.id] ? "▲" : "▼"}
          </button>

          {openCostsHouse[house.id] && (
            <div
              style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "16px",
                marginBottom: "30px",
              }}
            >
              {Object.keys(house.costs || defaultCosts).map((key) => (
                <div key={key} style={{ marginBottom: "20px" }}>
                  <strong style={{ display: "block", marginBottom: "8px" }}>{key}</strong>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                      <small>Monat</small>
                      <input
                        type="number"
                        value={house.costs?.[key]?.month || 0}
                        onChange={(e) => updateCosts(house.id, key, "month", e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <small>Quartal</small>
                      <input
                        type="number"
                        value={house.costs?.[key]?.quarter || 0}
                        onChange={(e) => updateCosts(house.id, key, "quarter", e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <small>Jahr</small>
                      <input
                        type="number"
                        value={house.costs?.[key]?.year || 0}
                        onChange={(e) => updateCosts(house.id, key, "year", e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ marginBottom: "15px", color: "#0A2540" }}>Wohnungen in diesem Haus</h4>

          {/* Wohnung hinzufügen */}
          <div
            style={{
              background: "#f0f7ff",
              padding: "25px",
              borderRadius: "16px",
              marginBottom: "25px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <input
                value={newApartment.name}
                onChange={(e) => setNewApartment({ ...newApartment, name: e.target.value })}
                placeholder="Wohnungsname"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <input
                value={newApartment.tenant}
                onChange={(e) => setNewApartment({ ...newApartment, tenant: e.target.value })}
                placeholder="Mieter 1"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <input
                value={newApartment.tenant2}
                onChange={(e) => setNewApartment({ ...newApartment, tenant2: e.target.value })}
                placeholder="Mieter 2"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <input
                type="number"
                value={newApartment.persons}
                onChange={(e) => setNewApartment({ ...newApartment, persons: e.target.value })}
                placeholder="Personen"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <input
                type="number"
                value={newApartment.kaltmiete}
                onChange={(e) => setNewApartment({ ...newApartment, kaltmiete: e.target.value })}
                placeholder="Kaltmiete €"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <input
                type="number"
                value={newApartment.warmmiete}
                onChange={(e) => setNewApartment({ ...newApartment, warmmiete: e.target.value })}
                placeholder="Warmmiete €"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <input
                type="number"
                value={newApartment.deposit}
                onChange={(e) => setNewApartment({ ...newApartment, deposit: e.target.value })}
                placeholder="Kaution €"
                style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
            </div>

            <button
              onClick={() => addApartment(house.id)}
              style={{
                marginTop: "20px",
                padding: "14px 28px",
                background: "#0A2540",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
              }}
            >
              + Wohnung hinzufügen
            </button>
          </div>

          {/* Wohnungs-Liste */}
          {house.apartments &&
            house.apartments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  background: "#f8fafc",
                  padding: "22px",
                  marginBottom: "16px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "18px" }}>{apt.name}</strong><br />
                    {apt.tenant} {apt.tenant2 && ` + ${apt.tenant2}`}<br />
                    <small>
                      Personen: {apt.persons} | Kalt: {apt.kaltmiete} € | 
                      Warm: {apt.warmmiete} € | Kaution: {apt.deposit} €
                    </small>
                  </div>

                  <div>
                    <button
                      onClick={() => setEditApartment({ houseId: house.id, apt })}
                      style={{ marginRight: "12px", padding: "8px 16px" }}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => deleteApartment(house.id, apt.id)}
                      style={{ color: "#ef4444", padding: "8px 16px" }}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}

      {/* Edit Modal für Wohnung */}
      {editApartment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              width: "420px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Wohnung bearbeiten</h3>

            <input
              value={editApartment.apt.name}
              onChange={(e) =>
                setEditApartment({
                  ...editApartment,
                  apt: { ...editApartment.apt, name: e.target.value },
                })
              }
              style={{ width: "100%", padding: "14px", marginBottom: "12px", borderRadius: "12px" }}
              placeholder="Wohnungsname"
            />

            <input
              value={editApartment.apt.tenant}
              onChange={(e) =>
                setEditApartment({
                  ...editApartment,
                  apt: { ...editApartment.apt, tenant: e.target.value },
                })
              }
              style={{ width: "100%", padding: "14px", marginBottom: "12px", borderRadius: "12px" }}
              placeholder="Mieter 1"
            />

            <input
              value={editApartment.apt.kaltmiete || ""}
              onChange={(e) =>
                setEditApartment({
                  ...editApartment,
                  apt: { ...editApartment.apt, kaltmiete: e.target.value },
                })
              }
              style={{ width: "100%", padding: "14px", marginBottom: "20px", borderRadius: "12px" }}
              placeholder="Kaltmiete"
              type="number"
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={saveApartmentEdit}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#0A2540",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                }}
              >
                Speichern
              </button>
              <button
                onClick={() => setEditApartment(null)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "12px",
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}