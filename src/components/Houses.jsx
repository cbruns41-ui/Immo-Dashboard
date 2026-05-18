import React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";

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

  // ==================== Haus hinzufügen / bearbeiten ====================
  const addHouse = async () => {
    if (!houseName.trim()) return;

    const existingHouse = houses.find((h) => h.id === editHouseId);

    const newHouseData = {
      id: editHouseId || uuidv4(),
      name: houseName,

      // 🔥 WICHTIG: Bestehende Daten komplett übernehmen
      apartments: existingHouse?.apartments || [],

      costs:
        existingHouse?.costs ||
        JSON.parse(JSON.stringify(defaultCosts)),

      // 🔥 FIX: Immer sauber als Number speichern
      monthlyLoan: Number(monthlyLoan) || 0,
      interestRate: Number(interestRate) || 0,
    };

    let newHouses;

    if (editHouseId) {
      newHouses = houses.map((h) =>
        h.id === editHouseId
          ? {
              ...h, // 🔥 vorhandene Daten behalten
              ...newHouseData,
            }
          : h
      );
    } else {
      newHouses = [...houses, newHouseData];
    }

    // 🔥 WICHTIG: await damit Speicherung sicher abgeschlossen wird
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

  // ==================== Wohnung ====================
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
          apartments: (h.apartments || []).filter(
            (a) => a.id !== aptId
          ),
        };
      }

      return h;
    });

    await setHouses([...newHouses]);
  };

  const startEditApartment = (houseId, apt) => {
    setEditApartment({
      houseId,
      apt: { ...apt },
    });
  };

  const saveApartmentEdit = async () => {
    if (!editApartment) return;

    const newHouses = houses.map((h) => {
      if (h.id === editApartment.houseId) {
        return {
          ...h,
          apartments: h.apartments.map((a) =>
            a.id === editApartment.apt.id
              ? editApartment.apt
              : a
          ),
        };
      }

      return h;
    });

    await setHouses([...newHouses]);

    setEditApartment(null);
  };

  // ==================== Nebenkosten (bidirektional) ====================
  const updateCosts = async (houseId, costType, field, value) => {
    const newHouses = houses.map((h) => {
      if (h.id === houseId) {
        const updatedCosts = { ...h.costs };

        if (!updatedCosts[costType]) {
          updatedCosts[costType] = {
            month: 0,
            quarter: 0,
            year: 0,
          };
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

        return {
          ...h,
          costs: updatedCosts,
        };
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
    <div
      style={{
        padding: "20px 15px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
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
            background:
              "linear-gradient(135deg, #0A2540, #00D4C8)",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
          }}
        >
          🏠
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0A2540",
            }}
          >
            Häuser & Wohnungen
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "18px",
            }}
          >
            Verwaltung deiner Objekte
          </p>
        </div>
      </div>

      {/* Neues Haus */}
      <div
        style={{
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          marginBottom: "40px",
        }}
      >
        <h3>Neues Haus hinzufügen</h3>

        <input
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          placeholder="Hausname / Adresse"
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "15px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={monthlyLoan}
              onChange={(e) =>
                setMonthlyLoan(e.target.value)
              }
              placeholder="Monatliche Darlehensrate (€)"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={interestRate}
              onChange={(e) =>
                setInterestRate(e.target.value)
              }
              placeholder="Zinssatz (%)"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
              }}
            />
          </div>
        </div>

        <button
          onClick={addHouse}
          style={{
            padding: "16px 40px",
            background: "#0A2540",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
          }}
        >
          {editHouseId
            ? "Haus aktualisieren"
            : "Haus hinzufügen"}
        </button>
      </div>

      {/* Häuser Liste */}
      {houses.map((house) => (
        <div
          key={house.id}
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {house.name}
            </h3>

            <div>
              <button
                onClick={() => startEditHouse(house)}
                style={{ marginRight: "12px" }}
              >
                Bearbeiten
              </button>

              <button
                onClick={() => deleteHouse(house.id)}
                style={{ color: "red" }}
              >
                Löschen
              </button>
            </div>
          </div>

          {/* Darlehens-Info */}
          {(house.monthlyLoan > 0 ||
            house.interestRate > 0) && (
            <div
              style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "25px",
              }}
            >
              <strong>Darlehen:</strong>{" "}
              {house.monthlyLoan} € / Monat
              {house.interestRate > 0 &&
                ` (${house.interestRate}% Zins)`}
            </div>
          )}

          {/* Wohnung hinzufügen */}
          <div style={{ marginBottom: "30px" }}>
            <h4>Wohnung hinzufügen</h4>

            <input
              value={newApartment.name}
              onChange={(e) =>
                setNewApartment({
                  ...newApartment,
                  name: e.target.value,
                })
              }
              placeholder="Wohnungsname / Nummer"
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
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
                width: "100%",
                padding: "14px",
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
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
              placeholder="Mieter 2 (optional)"
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
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
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
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
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
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
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              />
            </div>

            <button
              onClick={() => addApartment(house.id)}
              style={{
                marginTop: "15px",
                padding: "14px 30px",
                background: "#0A2540",
                color: "white",
                border: "none",
                borderRadius: "12px",
              }}
            >
              Wohnung hinzufügen
            </button>
          </div>

          {/* Wohnungen anzeigen */}
          {(house.apartments || []).length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h4>
                Wohnungen ({house.apartments.length})
              </h4>

              {house.apartments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    padding: "15px",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <strong>{apt.name}</strong> –{" "}
                  {apt.tenant}{" "}
                  {apt.tenant2 &&
                    `& ${apt.tenant2}`}

                  <div style={{ marginTop: "8px" }}>
                    Kalt: {apt.kaltmiete} € |
                    Warm: {apt.warmmiete} € |
                    Kaution: {apt.deposit} €
                  </div>

                  <button
                    onClick={() =>
                      startEditApartment(
                        house.id,
                        apt
                      )
                    }
                    style={{ marginRight: "10px" }}
                  >
                    Bearbeiten
                  </button>

                  <button
                    onClick={() =>
                      deleteApartment(
                        house.id,
                        apt.id
                      )
                    }
                    style={{ color: "red" }}
                  >
                    Löschen
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Nebenkosten */}
          <button
            onClick={() =>
              setOpenCostsHouse({
                ...openCostsHouse,
                [house.id]:
                  !openCostsHouse[house.id],
              })
            }
            style={{ marginBottom: "15px" }}
          >
            Nebenkosten bearbeiten
          </button>

          {openCostsHouse[house.id] && (
            <div
              style={{
                padding: "25px",
                background: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              <h4>
                Nebenkosten für {house.name}
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 80px 80px 80px",
                  gap: "10px",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                <div>Kostenart</div>
                <div>Monat</div>
                <div>Quartal</div>
                <div>Jahr</div>

                {Object.keys(defaultCosts).map(
                  (key) => {
                    const cost =
                      house.costs?.[key] || {
                        month: 0,
                        quarter: 0,
                        year: 0,
                      };

                    return (
                      <React.Fragment key={key}>
                        <div
                          style={{
                            padding: "8px 0",
                          }}
                        >
                          {key}
                        </div>

                        <input
                          type="number"
                          value={cost.month}
                          onChange={(e) =>
                            updateCosts(
                              house.id,
                              key,
                              "month",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            border:
                              "1px solid #ddd",
                          }}
                        />

                        <input
                          type="number"
                          value={cost.quarter}
                          onChange={(e) =>
                            updateCosts(
                              house.id,
                              key,
                              "quarter",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            border:
                              "1px solid #ddd",
                          }}
                        />

                        <input
                          type="number"
                          value={cost.year}
                          onChange={(e) =>
                            updateCosts(
                              house.id,
                              key,
                              "year",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            border:
                              "1px solid #ddd",
                          }}
                        />
                      </React.Fragment>
                    );
                  }
                )}
              </div>

              <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  background: "#0A2540",
                  color: "white",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Monatliche Nebenkosten
                    gesamt:
                  </span>

                  <span>
                    {getTotalMonthlyCosts(
                      house
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginTop: "8px",
                  }}
                >
                  <span>
                    Jährliche Nebenkosten
                    gesamt:
                  </span>

                  <span>
                    {getTotalYearlyCosts(
                      house
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}