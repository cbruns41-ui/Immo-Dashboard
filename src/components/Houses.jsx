import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useImmo } from "../context/ImmoContext";
import { defaultCosts } from "../utils/calculations";
import {
  Home,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  X,
  MapPin,
} from "lucide-react";

export default function Houses() {
  const { houses, setHouses } = useImmo();

  // Modals
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);

  const [showApartmentModal, setShowApartmentModal] = useState(false);
  const [currentHouseForApt, setCurrentHouseForApt] = useState(null);
  const [editingApartment, setEditingApartment] = useState(null);

  // Nebenkosten Toggle
  const [openCostsHouse, setOpenCostsHouse] = useState({});

  // House Form
  const [houseForm, setHouseForm] = useState({
    name: "",
    street: "",
    houseNumber: "",
    city: "",
    monthlyLoan: "",
    interestRate: "",
  });

  // Apartment Form
  const [apartmentForm, setApartmentForm] = useState({
    name: "",
    tenant: "",
    tenant2: "",
    persons: "1",
    kaltmiete: "",
    warmmiete: "",
    deposit: "",
    notes: "",
  });

  // ====================== HOUSE ======================
  const openAddHouse = () => {
    setHouseForm({ name: "", street: "", houseNumber: "", city: "", monthlyLoan: "", interestRate: "" });
    setEditingHouse(null);
    setShowHouseModal(true);
  };

  const openEditHouse = (house) => {
    setHouseForm({
      name: house.name || "",
      street: house.street || "",
      houseNumber: house.houseNumber || "",
      city: house.city || "",
      monthlyLoan: house.monthlyLoan?.toString() || "",
      interestRate: house.interestRate?.toString() || "",
    });
    setEditingHouse(house);
    setShowHouseModal(true);
  };

  const saveHouse = async () => {
    if (!houseForm.name.trim()) return alert("Hausname ist erforderlich");

    const newHouseData = {
      id: editingHouse ? editingHouse.id : uuidv4(),
      name: houseForm.name.trim(),
      street: houseForm.street.trim(),
      houseNumber: houseForm.houseNumber.trim(),
      city: houseForm.city.trim(),
      apartments: editingHouse ? editingHouse.apartments || [] : [],
      costs: editingHouse ? editingHouse.costs : JSON.parse(JSON.stringify(defaultCosts)),
      monthlyLoan: Number(houseForm.monthlyLoan) || 0,
      interestRate: Number(houseForm.interestRate) || 0,
    };

    const newHouses = editingHouse
      ? houses.map((h) => (h.id === editingHouse.id ? { ...h, ...newHouseData } : h))
      : [...houses, newHouseData];

    await setHouses(newHouses);
    setShowHouseModal(false);
  };

  const deleteHouse = async (id) => {
    if (!window.confirm("Haus und alle Wohnungen wirklich löschen?")) return;
    await setHouses(houses.filter((h) => h.id !== id));
  };

  // ====================== APARTMENT ======================
  const openAddApartment = (houseId) => {
    setApartmentForm({ name: "", tenant: "", tenant2: "", persons: "1", kaltmiete: "", warmmiete: "", deposit: "", notes: "" });
    setEditingApartment(null);
    setCurrentHouseForApt(houseId);
    setShowApartmentModal(true);
  };

  const openEditApartment = (houseId, apt) => {
    setApartmentForm({
      name: apt.name || "",
      tenant: apt.tenant || "",
      tenant2: apt.tenant2 || "",
      persons: apt.persons?.toString() || "1",
      kaltmiete: apt.kaltmiete?.toString() || "",
      warmmiete: apt.warmmiete?.toString() || "",
      deposit: apt.deposit?.toString() || "",
      notes: apt.notes || "",
    });
    setEditingApartment(apt);
    setCurrentHouseForApt(houseId);
    setShowApartmentModal(true);
  };

  const saveApartment = async () => {
    if (!apartmentForm.name.trim()) return alert("Wohnungsname ist erforderlich");

    const aptData = {
      id: editingApartment ? editingApartment.id : uuidv4(),
      name: apartmentForm.name.trim(),
      tenant: apartmentForm.tenant.trim(),
      tenant2: apartmentForm.tenant2.trim(),
      persons: Number(apartmentForm.persons) || 1,
      kaltmiete: Number(apartmentForm.kaltmiete) || 0,
      warmmiete: Number(apartmentForm.warmmiete) || 0,
      deposit: Number(apartmentForm.deposit) || 0,
      notes: apartmentForm.notes.trim(),
    };

    const newHouses = houses.map((h) => {
      if (h.id === currentHouseForApt) {
        if (editingApartment) {
          return { ...h, apartments: h.apartments.map((a) => (a.id === editingApartment.id ? aptData : a)) };
        }
        return { ...h, apartments: [...(h.apartments || []), aptData] };
      }
      return h;
    });

    await setHouses(newHouses);
    setShowApartmentModal(false);
  };

  const deleteApartment = async (houseId, aptId) => {
    if (!window.confirm("Wohnung wirklich löschen?")) return;
    const newHouses = houses.map((h) =>
      h.id === houseId ? { ...h, apartments: (h.apartments || []).filter((a) => a.id !== aptId) } : h
    );
    await setHouses(newHouses);
  };

  // ====================== COSTS ======================
  const updateCosts = async (houseId, costType, field, value) => {
    const newHouses = houses.map((h) => {
      if (h.id === houseId) {
        const updatedCosts = { ...h.costs };
        if (!updatedCosts[costType]) updatedCosts[costType] = { month: 0, quarter: 0, year: 0 };
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
    await setHouses(newHouses);
  };

  const getTotalMonthlyCosts = (house) =>
    Object.values(house?.costs || {}).reduce((sum, item) => sum + (Number(item?.month) || 0), 0);

  const getTotalYearlyCosts = (house) =>
    Object.values(house?.costs || {}).reduce((sum, item) => sum + (Number(item?.year) || 0), 0);

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <h1 style={title}>Häuser & Wohnungen</h1>
          <p style={subtitle}>Verwalte deine Immobilien</p>
        </div>

        <div style={card}>
          <button onClick={openAddHouse} style={addHouseBtn}>
            <Plus size={24} />
            Neues Haus hinzufügen
          </button>
        </div>

        {houses.map((house) => (
          <div key={house.id} style={card}>
            <div style={cardTop}>
              <div style={iconWrap}>
                <Home size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={cardTitle}>{house.name}</div>
                {(house.street || house.city) && (
                  <div style={addressLine}>
                    <MapPin size={16} style={{ marginRight: 6 }} />
                    {house.street} {house.houseNumber} • {house.city}
                  </div>
                )}
                {(house.monthlyLoan > 0 || house.interestRate > 0) && (
                  <div style={loanInfo}>
                    <TrendingUp size={16} style={{ marginRight: 6 }} />
                    Darlehen: {house.monthlyLoan} € / Monat ({house.interestRate}%)
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEditHouse(house)} style={editBtn}>
                  <Edit size={18} />
                </button>
                <button onClick={() => deleteHouse(house.id)} style={deleteBtn}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div style={statsGridSmall}>
              <div style={statCardSmall}>
                <span>Monatlich</span>
                <strong>{getTotalMonthlyCosts(house).toFixed(0)} €</strong>
              </div>
              <div style={statCardSmall}>
                <span>Jährlich</span>
                <strong>{getTotalYearlyCosts(house).toFixed(0)} €</strong>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={sectionHeader}>
                <h4>Wohnungen ({house.apartments?.length || 0})</h4>
                <button onClick={() => openAddApartment(house.id)} style={smallAddBtn}>
                  <Plus size={16} /> Neue Wohnung
                </button>
              </div>

              <div style={apartmentGrid}>
                {(house.apartments || []).map((apt) => (
                  <div key={apt.id} style={apartmentCard}>
                    <strong>{apt.name}</strong>
                    <p style={{ margin: "6px 0 10px", fontSize: 14, color: "#334155" }}>
                      {apt.tenant} {apt.tenant2 && `& ${apt.tenant2}`}
                    </p>
                    <div style={{ fontSize: 14 }}>
                      Kalt: <strong>{apt.kaltmiete} €</strong> | Warm: <strong>{apt.warmmiete} €</strong>
                    </div>
                    <div style={smallActions}>
                      <button onClick={() => openEditApartment(house.id, apt)} style={tinyEditBtn}>Bearbeiten</button>
                      <button onClick={() => deleteApartment(house.id, apt.id)} style={tinyDeleteBtn}>Löschen</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setOpenCostsHouse((prev) => ({ ...prev, [house.id]: !prev[house.id] }))}
              style={secondaryBtn}
            >
              Nebenkosten bearbeiten
            </button>

            {openCostsHouse[house.id] && (
              <div style={costsCard}>
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
                        <div style={{ fontWeight: 500 }}>{key}</div>
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
              </div>
            )}
          </div>
        ))}
      </div>

      {/* HOUSE MODAL */}
      {showHouseModal && (
        <div style={modalOverlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <h3>{editingHouse ? "Haus bearbeiten" : "Neues Haus anlegen"}</h3>
              <button onClick={() => setShowHouseModal(false)} style={closeBtn}>
                <X size={26} />
              </button>
            </div>

            <label style={label}>Hausname / Objektbezeichnung</label>
            <input placeholder="z. B. Einfamilienhaus Musterstraße" value={houseForm.name} onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })} style={modalInput} />

            <label style={label}>Straße</label>
            <input placeholder="Straße" value={houseForm.street} onChange={(e) => setHouseForm({ ...houseForm, street: e.target.value })} style={modalInput} />

            <div style={modalRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Hausnummer</label>
                <input placeholder="Nr." value={houseForm.houseNumber} onChange={(e) => setHouseForm({ ...houseForm, houseNumber: e.target.value })} style={modalInput} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={label}>Ort</label>
                <input placeholder="Ort / Stadt" value={houseForm.city} onChange={(e) => setHouseForm({ ...houseForm, city: e.target.value })} style={modalInput} />
              </div>
            </div>

            <div style={modalRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Monatliche Darlehensrate (€)</label>
                <input type="number" placeholder="850" value={houseForm.monthlyLoan} onChange={(e) => setHouseForm({ ...houseForm, monthlyLoan: e.target.value })} style={modalInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Zinssatz (%)</label>
                <input type="number" step="0.01" placeholder="2.5" value={houseForm.interestRate} onChange={(e) => setHouseForm({ ...houseForm, interestRate: e.target.value })} style={modalInput} />
              </div>
            </div>

            <button onClick={saveHouse} style={primaryBtn}>
              {editingHouse ? "Änderungen speichern" : "Haus anlegen"}
            </button>
          </div>
        </div>
      )}

      {/* APARTMENT MODAL */}
      {showApartmentModal && (
        <div style={modalOverlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <h3>{editingApartment ? "Wohnung bearbeiten" : "Neue Wohnung anlegen"}</h3>
              <button onClick={() => setShowApartmentModal(false)} style={closeBtn}>
                <X size={26} />
              </button>
            </div>

            <label style={label}>Wohnungsname / Nummer</label>
            <input placeholder="z. B. EG links" value={apartmentForm.name} onChange={(e) => setApartmentForm({ ...apartmentForm, name: e.target.value })} style={modalInput} />

            <label style={label}>Mieter 1</label>
            <input placeholder="Vor- und Nachname" value={apartmentForm.tenant} onChange={(e) => setApartmentForm({ ...apartmentForm, tenant: e.target.value })} style={modalInput} />

            <label style={label}>Mieter 2 (optional)</label>
            <input placeholder="Vor- und Nachname" value={apartmentForm.tenant2} onChange={(e) => setApartmentForm({ ...apartmentForm, tenant2: e.target.value })} style={modalInput} />

            <div style={modalRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Kaltmiete (€)</label>
                <input type="number" value={apartmentForm.kaltmiete} onChange={(e) => setApartmentForm({ ...apartmentForm, kaltmiete: e.target.value })} style={modalInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Warmmiete (€)</label>
                <input type="number" value={apartmentForm.warmmiete} onChange={(e) => setApartmentForm({ ...apartmentForm, warmmiete: e.target.value })} style={modalInput} />
              </div>
            </div>

            <div style={modalRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Kaution (€)</label>
                <input type="number" value={apartmentForm.deposit} onChange={(e) => setApartmentForm({ ...apartmentForm, deposit: e.target.value })} style={modalInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Personen</label>
                <input type="number" value={apartmentForm.persons} onChange={(e) => setApartmentForm({ ...apartmentForm, persons: e.target.value })} style={modalInput} />
              </div>
            </div>

            <button onClick={saveApartment} style={primaryBtn}>
              {editingApartment ? "Wohnung aktualisieren" : "Wohnung hinzufügen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const page = { minHeight: "100vh", padding: "24px 16px", background: "#f6f7fb", fontFamily: "Inter, Arial", color: "#0f172a" };
const container = { maxWidth: 1100, margin: "0 auto" };

const header = { marginBottom: 28, textAlign: "center" };
const title = { fontSize: 36, fontWeight: 800, marginBottom: 8 };
const subtitle = { fontSize: 16, color: "#64748b" };

const card = { background: "white", borderRadius: 22, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,0.04)", marginBottom: 24 };
const cardTop = { display: "flex", alignItems: "center", gap: 16, marginBottom: 20 };
const iconWrap = { width: 58, height: 58, borderRadius: 18, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" };
const cardTitle = { fontSize: 20, fontWeight: 700 };

const addressLine = { fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", marginTop: 4 };

const addHouseBtn = { width: "100%", padding: "16px", background: "#0f172a", color: "white", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" };

const loanInfo = { fontSize: 14, color: "#64748b", marginTop: 4 };

const statsGridSmall = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 };
const statCardSmall = { background: "#f8fafc", padding: 16, borderRadius: 14, textAlign: "center" };

const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 };

const apartmentGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 };
const apartmentCard = { background: "#f8fafc", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0" };

const smallAddBtn = { background: "#0f172a", color: "white", border: "none", padding: "8px 16px", borderRadius: 12, fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" };

const secondaryBtn = { width: "100%", padding: "14px", background: "#f1f5f9", color: "#0f172a", border: "none", borderRadius: 14, fontWeight: 600, marginTop: 20, cursor: "pointer" };
const costsCard = { background: "#f8fafc", padding: 24, borderRadius: 18, marginTop: 20 };
const costsGrid = { display: "grid", gridTemplateColumns: "1fr 90px 90px 90px", gap: 12, marginTop: 16, alignItems: "center" };
const smallInput = { padding: 10, borderRadius: 10, border: "1px solid #ddd", textAlign: "center", fontSize: 14 };

const editBtn = { padding: "8px 14px", background: "#f1f5f9", border: "none", borderRadius: 10, cursor: "pointer" };
const deleteBtn = { padding: "8px 14px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 10, cursor: "pointer" };
const smallActions = { display: "flex", gap: 8, marginTop: 16 };
const tinyEditBtn = { flex: 1, padding: "8px", background: "#f1f5f9", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer" };
const tinyDeleteBtn = { flex: 1, padding: "8px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer" };

/* Modal Styles */
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modal = { background: "white", borderRadius: 24, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 40px rgba(15,23,42,0.15)" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 };
const closeBtn = { background: "none", border: "none", color: "#64748b", cursor: "pointer" };
const modalInput = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 8, fontSize: 16, boxSizing: "border-box" };
const modalRow = { display: "flex", gap: 14 };
const label = { fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 6, display: "block" };
const primaryBtn = { width: "100%", padding: "16px", background: "#0f172a", color: "white", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, marginTop: 20, cursor: "pointer" };