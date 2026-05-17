import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";

export default function Houses() {
  const { houses, setHouses } = useImmo();

  const [houseName, setHouseName] = useState("");
  const [editHouseId, setEditHouseId] = useState(null);
  const [openCostsHouse, setOpenCostsHouse] = useState({});

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

  return (
    <div>
      <h2>🏠 Häuser & Wohnungen</h2>

      <div style={{ marginBottom: 30 }}>
        <input
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          placeholder="Neuer Hausname"
          style={{
            padding: 12,
            width: 350,
            marginRight: 10,
          }}
        />

        <button
          onClick={addHouse}
          style={{
            padding: "12px 20px",
          }}
        >
          + Haus hinzufügen
        </button>
      </div>

      {houses.map((house) => (
        <div
          key={house.id}
          style={{
            background: "white",
            padding: 25,
            marginBottom: 25,
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h3>{house.name}</h3>

            <button
              onClick={() => deleteHouse(house.id)}
              style={{
                color: "red",
              }}
            >
              Haus löschen
            </button>
          </div>

          <button
            onClick={() => toggleCosts(house.id)}
            style={{
              margin: "15px 0",
            }}
          >
            Nebenkosten bearbeiten{" "}
            {openCostsHouse[house.id] ? "▲" : "▼"}
          </button>

          {openCostsHouse[house.id] && (
            <div
              style={{
                background: "#f8f9fa",
                padding: 20,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              {Object.keys(house.costs || defaultCosts).map((key) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 15,
                  }}
                >
                  <strong>{key}</strong>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 8,
                    }}
                  >
                    <div>
                      Monat:
                      <input
                        type="number"
                        value={house.costs?.[key]?.month || 0}
                        onChange={(e) =>
                          updateCosts(
                            house.id,
                            key,
                            "month",
                            e.target.value
                          )
                        }
                        style={{
                          width: 100,
                        }}
                      />
                    </div>

                    <div>
                      Quartal:
                      <input
                        type="number"
                        value={house.costs?.[key]?.quarter || 0}
                        onChange={(e) =>
                          updateCosts(
                            house.id,
                            key,
                            "quarter",
                            e.target.value
                          )
                        }
                        style={{
                          width: 100,
                        }}
                      />
                    </div>

                    <div>
                      Jahr:
                      <input
                        type="number"
                        value={house.costs?.[key]?.year || 0}
                        onChange={(e) =>
                          updateCosts(
                            house.id,
                            key,
                            "year",
                            e.target.value
                          )
                        }
                        style={{
                          width: 100,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h4>Wohnungen in diesem Haus</h4>

          <div
            style={{
              padding: 20,
              background: "#f0f7ff",
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <input
              value={newApartment.name}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  name: e.target.value,
                })
              }
              placeholder="Wohnungsname"
              style={{
                marginRight: 8,
                padding: 10,
                width: "48%",
              }}
            />

            <input
              value={newApartment.tenant}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  tenant: e.target.value,
                })
              }
              placeholder="Mieter 1"
              style={{
                marginRight: 8,
                padding: 10,
                width: "48%",
              }}
            />

            <input
              value={newApartment.tenant2}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  tenant2: e.target.value,
                })
              }
              placeholder="Mieter 2"
              style={{
                marginRight: 8,
                padding: 10,
                width: "48%",
              }}
            />

            <input
              type="number"
              value={newApartment.persons}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  persons: e.target.value,
                })
              }
              placeholder="Anzahl Personen"
              style={{
                width: "32%",
                marginRight: 8,
                padding: 10,
              }}
            />

            <input
              type="number"
              value={newApartment.kaltmiete}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  kaltmiete: e.target.value,
                })
              }
              placeholder="Kaltmiete"
              style={{
                width: "32%",
                marginRight: 8,
                padding: 10,
              }}
            />

            <input
              type="number"
              value={newApartment.warmmiete}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  warmmiete: e.target.value,
                })
              }
              placeholder="Warmmiete"
              style={{
                width: "32%",
                marginRight: 8,
                padding: 10,
              }}
            />

            <input
              type="number"
              value={newApartment.deposit}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  deposit: e.target.value,
                })
              }
              placeholder="Kaution"
              style={{
                width: "32%",
                padding: 10,
              }}
            />

            <button
              onClick={() => addApartment(house.id)}
              style={{
                marginTop: 15,
              }}
            >
              + Wohnung hinzufügen
            </button>
          </div>

          {house.apartments &&
            house.apartments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  padding: 18,
                  background: "#f8fafc",
                  marginBottom: 12,
                  borderRadius: 10,
                }}
              >
                <strong>{apt.name}</strong> — {apt.tenant}
                {apt.tenant2 && ` + ${apt.tenant2}`}

                <br />

                Personen: {apt.persons} | Kalt: {apt.kaltmiete} € |
                Warm: {apt.warmmiete} € | Kaution: {apt.deposit} €

                <button
                  onClick={() =>
                    deleteApartment(house.id, apt.id)
                  }
                  style={{
                    marginLeft: 15,
                    color: "red",
                  }}
                >
                  Löschen
                </button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}