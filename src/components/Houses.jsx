import React, { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
import { defaultCosts } from "../utils/calculations";
import EmptyState from "./EmptyState";
import {
  Home,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  X,
  MapPin,
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
  FileText,
  Calculator,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

export default function Houses() {
  const { houses, setHouses } = useImmo();
  const { error: notifyError, success: notifySuccess, warning: notifyWarning } =
    useNotifications();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    minRent: "",
    maxRent: "",
    hasTenant: "",
    sortBy: "name" // name, rent, city
  });

  // Filtered houses
  const filteredHouses = useMemo(() => {
    return houses.filter(house => {
      // Search query
      const matchesSearch = 
        house.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.street?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // City filter
      if (filters.city && house.city?.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Rent filter
      const avgRent = house.apartments?.length > 0 
        ? house.apartments.reduce((sum, apt) => sum + (apt.kaltmiete || 0), 0) / house.apartments.length 
        : 0;
      
      if (filters.minRent && avgRent < Number(filters.minRent)) return false;
      if (filters.maxRent && avgRent > Number(filters.maxRent)) return false;

      // Tenant filter
      if (filters.hasTenant === "has" && (!house.apartments || house.apartments.every(apt => !apt.tenant))) {
        return false;
      }
      if (filters.hasTenant === "empty" && house.apartments?.some(apt => apt.tenant)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "rent":
          const aRent = a.apartments?.reduce((sum, apt) => sum + (apt.kaltmiete || 0), 0) || 0;
          const bRent = b.apartments?.reduce((sum, apt) => sum + (apt.kaltmiete || 0), 0) || 0;
          return bRent - aRent;
        case "city":
          return (a.city || "").localeCompare(b.city || "");
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });
  }, [houses, searchQuery, filters]);

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
    tenant_phone: "",
    tenant_email: "",
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
    if (!houseForm.name.trim()) {
      notifyWarning("Hausname ist erforderlich");
      return;
    }

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

    const ok = await setHouses(newHouses);
    if (ok !== false) {
      notifySuccess(editingHouse ? "Haus aktualisiert" : "Haus angelegt");
      setShowHouseModal(false);
    }
  };

  const deleteHouse = async (id) => {
    if (!window.confirm("Haus und alle Wohnungen wirklich löschen?")) return;
    await setHouses(houses.filter((h) => h.id !== id));
  };

  // ====================== APARTMENT ======================
  const openAddApartment = (houseId) => {
    setApartmentForm({
      name: "",
      tenant: "",
      tenant2: "",
      tenant_phone: "",
      tenant_email: "",
      persons: "1",
      kaltmiete: "",
      warmmiete: "",
      deposit: "",
      notes: "",
    });
    setEditingApartment(null);
    setCurrentHouseForApt(houseId);
    setShowApartmentModal(true);
  };

  const openEditApartment = (houseId, apt) => {
    setApartmentForm({
      name: apt.name || "",
      tenant: apt.tenant || "",
      tenant2: apt.tenant2 || "",
      tenant_phone: apt.tenant_phone || "",
      tenant_email: apt.tenant_email || "",
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
    if (!apartmentForm.name.trim()) {
      notifyWarning("Wohnungsname ist erforderlich");
      return;
    }

    const aptData = {
      id: editingApartment ? editingApartment.id : uuidv4(),
      name: apartmentForm.name.trim(),
      tenant: apartmentForm.tenant.trim(),
      tenant2: apartmentForm.tenant2.trim(),
      tenant_phone: apartmentForm.tenant_phone.trim(),
      tenant_email: apartmentForm.tenant_email.trim(),
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

    const ok = await setHouses(newHouses);
    if (ok !== false) {
      notifySuccess(
        editingApartment ? "Wohnung aktualisiert" : "Wohnung hinzugefügt"
      );
      setShowApartmentModal(false);
    }
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

  // Nebenkosten-Berechnungen
  const getTotalAdvancePayments = (house) => {
    return (house.apartments || []).reduce((sum, apt) => {
      const warm = Number(apt.warmmiete) || 0;
      const kalt = Number(apt.kaltmiete) || 0;
      const advance = warm - kalt;
      return sum + Math.max(0, advance);
    }, 0);
  };

  const getActualCosts = (house) => {
    return getTotalMonthlyCosts(house);
  };

  const getCostDifference = (house) => {
    const advance = getTotalAdvancePayments(house);
    const actual = getActualCosts(house);
    return advance - actual;
  };

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <h1 style={title}>Häuser & Wohnungen</h1>
          <p style={subtitle}>Verwalte deine Immobilien</p>
        </div>

        {/* Search & Filter Bar */}
        <div style={searchBar}>
          <div style={searchInputWrapper}>
            <Search size={20} style={searchIcon} />
            <input
              type="text"
              placeholder="Suche nach Name, Stadt, Straße..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInput}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={filterButton}
          >
            <SlidersHorizontal size={20} />
            Filter
            {showFilters && <X size={16} style={{ marginLeft: 4 }} />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={filterPanel}>
            <div style={filterGrid}>
              <div style={filterGroup}>
                <label style={filterLabel}>Stadt</label>
                <input
                  type="text"
                  placeholder="Stadt"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  style={filterInput}
                />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Min. Miete</label>
                <input
                  type="number"
                  placeholder="€"
                  value={filters.minRent}
                  onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
                  style={filterInput}
                />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Max. Miete</label>
                <input
                  type="number"
                  placeholder="€"
                  value={filters.maxRent}
                  onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
                  style={filterInput}
                />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Mieter</label>
                <select
                  value={filters.hasTenant}
                  onChange={(e) => setFilters({ ...filters, hasTenant: e.target.value })}
                  style={filterInput}
                >
                  <option value="">Alle</option>
                  <option value="has">Mit Mieter</option>
                  <option value="empty">Leer</option>
                </select>
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Sortierung</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  style={filterInput}
                >
                  <option value="name">Name</option>
                  <option value="rent">Miete</option>
                  <option value="city">Stadt</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setFilters({ city: "", minRent: "", maxRent: "", hasTenant: "", sortBy: "name" })}
              style={clearFiltersBtn}
            >
              Filter zurücksetzen
            </button>
          </div>
        )}

        <div style={card}>
          <button onClick={openAddHouse} style={addHouseBtn}>
            <Plus size={24} />
            Neues Haus hinzufügen
          </button>
        </div>

        {filteredHouses.length === 0 ? (
          <EmptyState 
            type="houses" 
            actionText="Erstes Haus hinzufügen"
            onAction={openAddHouse}
          />
        ) : (
          filteredHouses.map((house) => (
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

            {/* Nebenkosten-Differenzierung */}
            <div style={costsOverviewGrid}>
              <div style={costOverviewCard}>
                <div style={costOverviewLabel}>Vorauszahlungen</div>
                <div style={costOverviewValue}>{getTotalAdvancePayments(house).toFixed(0)} €</div>
                <div style={costOverviewSub}>pro Monat</div>
              </div>
              <div style={costOverviewCard}>
                <div style={costOverviewLabel}>Wirkliche Kosten</div>
                <div style={costOverviewValue}>{getActualCosts(house).toFixed(0)} €</div>
                <div style={costOverviewSub}>pro Monat</div>
              </div>
              <div style={{
                ...costOverviewCard,
                background: getCostDifference(house) >= 0 ? '#dcfce7' : '#fee2e2',
                borderColor: getCostDifference(house) >= 0 ? '#86efac' : '#fca5a5'
              }}>
                <div style={costOverviewLabel}>Differenz</div>
                <div style={{
                  ...costOverviewValue,
                  color: getCostDifference(house) >= 0 ? '#166534' : '#dc2626'
                }}>
                  {getCostDifference(house) >= 0 ? '+' : ''}{getCostDifference(house).toFixed(0)} €
                </div>
                <div style={{
                  ...costOverviewSub,
                  color: getCostDifference(house) >= 0 ? '#166534' : '#dc2626'
                }}>
                  {getCostDifference(house) >= 0 ? 'Überschuss' : 'Verlust'}
                </div>
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
                    <div style={apartmentCardHeader}>
                      <div style={apartmentIcon}>
                        <Home size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={apartmentTitle}>{apt.name}</div>
                        <div style={apartmentTenant}>
                          {apt.tenant} {apt.tenant2 && `& ${apt.tenant2}`}
                        </div>
                      </div>
                    </div>

                    <div style={apartmentDetails}>
                      <div style={detailItem}>
                        <Users size={14} style={detailIcon} />
                        <span>{apt.persons} Person{apt.persons !== '1' ? 'en' : ''}</span>
                      </div>
                      <div style={detailItem}>
                        <DollarSign size={14} style={detailIcon} />
                        <span>Kalt: <strong>{apt.kaltmiete} €</strong></span>
                      </div>
                      <div style={detailItem}>
                        <DollarSign size={14} style={detailIcon} />
                        <span>Warm: <strong>{apt.warmmiete} €</strong></span>
                      </div>
                      <div style={detailItem}>
                        <DollarSign size={14} style={detailIcon} />
                        <span>Kaution: <strong>{apt.deposit} €</strong></span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div style={notesSection}>
                        <FileText size={14} style={notesIcon} />
                        <span style={notesText}>{apt.notes}</span>
                      </div>
                    )}

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
                <div style={costsCardHeader}>
                  <div style={costsCardTitle}>
                    <Calculator size={20} style={{ marginRight: 8 }} />
                    Nebenkosten für {house.name}
                  </div>
                </div>
                <div style={costsGrid}>
                  <div style={costsHeader}>Kostenart</div>
                  <div style={costsHeader}>Monat</div>
                  <div style={costsHeader}>Quartal</div>
                  <div style={costsHeader}>Jahr</div>
                  {Object.keys(defaultCosts).map((key) => {
                    const cost = house.costs?.[key] || { month: 0, quarter: 0, year: 0 };
                    return (
                      <React.Fragment key={key}>
                        <div style={costRowLabel}>{key}</div>
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
                {/* Ergebnis-Summe */}
                <div style={costsSummary}>
                  <div style={costsSummaryLabel}>Gesamtkosten</div>
                  <div style={costsSummaryValue}>
                    <div style={costsSummaryItem}>
                      <span style={costsSummaryItemLabel}>Monat:</span>
                      <strong style={costsSummaryItemValue}>{getTotalMonthlyCosts(house).toFixed(2)} €</strong>
                    </div>
                    <div style={costsSummaryItem}>
                      <span style={costsSummaryItemLabel}>Quartal:</span>
                      <strong style={costsSummaryItemValue}>{(getTotalMonthlyCosts(house) * 3).toFixed(2)} €</strong>
                    </div>
                    <div style={costsSummaryItem}>
                      <span style={costsSummaryItemLabel}>Jahr:</span>
                      <strong style={costsSummaryItemValue}>{getTotalYearlyCosts(house).toFixed(2)} €</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
        )}
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

            <label style={label}>Telefon Mieter</label>
            <input
              type="tel"
              placeholder="+49 …"
              value={apartmentForm.tenant_phone}
              onChange={(e) =>
                setApartmentForm({ ...apartmentForm, tenant_phone: e.target.value })
              }
              style={modalInput}
            />

            <label style={label}>E-Mail Mieter</label>
            <input
              type="email"
              placeholder="mieter@example.com"
              value={apartmentForm.tenant_email}
              onChange={(e) =>
                setApartmentForm({ ...apartmentForm, tenant_email: e.target.value })
              }
              style={modalInput}
            />

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
   STYLES - SaaS Style iOS/Android
========================= */
const page = {
  minHeight: "100vh",
  padding: "20px 16px 100px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a"
};

const container = { maxWidth: 1200, margin: "0 auto" };

const header = { marginBottom: 32, textAlign: "center" };
const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 8,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};
const subtitle = { fontSize: 16, color: "#64748b", fontWeight: 500 };

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 24,
  padding: 28,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
  marginBottom: 24
};

const cardTop = { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 };
const iconWrap = {
  width: 64,
  height: 64,
  borderRadius: 20,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)"
};
const cardTitle = { fontSize: 22, fontWeight: 800, color: "#0f172a" };

const addressLine = { fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", marginTop: 6, fontWeight: 500 };

const addHouseBtn = {
  width: "100%",
  padding: "18px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 16,
  fontSize: 17,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
  transition: "all 0.3s ease"
};

const loanInfo = { fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 500 };

/* Nebenkosten Overview Grid */
const costsOverviewGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  marginBottom: 28
};

const costOverviewCard = {
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  padding: 20,
  borderRadius: 18,
  border: "2px solid #e2e8f0",
  textAlign: "center",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
};

const costOverviewLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 8
};

const costOverviewValue = {
  fontSize: 28,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 4
};

const costOverviewSub = {
  fontSize: 12,
  fontWeight: 600,
  color: "#94a3b8"
};

const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 };

const apartmentGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 16
};

const apartmentCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  padding: 24,
  borderRadius: 20,
  border: "2px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease"
};

const apartmentCardHeader = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 16
};

const apartmentIcon = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)"
};

const apartmentTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 4
};

const apartmentTenant = {
  fontSize: 14,
  color: "#64748b",
  fontWeight: 500
};

const apartmentDetails = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12,
  marginBottom: 16
};

const detailItem = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  color: "#475569",
  fontWeight: 500
};

const detailIcon = {
  color: "#3b82f6",
  flexShrink: 0
};

const notesSection = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: 12,
  background: "#f1f5f9",
  borderRadius: 12,
  marginBottom: 16
};

const notesIcon = {
  color: "#3b82f6",
  flexShrink: 0,
  marginTop: 2
};

const notesText = {
  fontSize: 13,
  color: "#475569",
  fontWeight: 500,
  lineHeight: 1.5
};

const smallAddBtn = {
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 14,
  fontSize: 14,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
};

const secondaryBtn = {
  width: "100%",
  padding: "16px",
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  color: "#0f172a",
  border: "none",
  borderRadius: 16,
  fontWeight: 700,
  marginTop: 24,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
};

const costsCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  padding: 28,
  borderRadius: 22,
  marginTop: 24,
  border: "2px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
};

const costsCardHeader = {
  marginBottom: 20
};

const costsCardTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#1e293b",
  display: "flex",
  alignItems: "center"
};

const costsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 100px 100px 100px",
  gap: 12,
  marginTop: 16,
  alignItems: "center"
};

const costsHeader = {
  fontSize: 13,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  paddingBottom: 8
};

const costRowLabel = {
  fontWeight: 700,
  color: "#334155",
  fontSize: 14
};

const costsSummary = {
  marginTop: 24,
  padding: 20,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  borderRadius: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)"
};

const costsSummaryLabel = {
  fontSize: 16,
  fontWeight: 800,
  color: "white"
};

const costsSummaryValue = {
  display: "flex",
  gap: 24
};

const costsSummaryItem = {
  textAlign: "center"
};

const costsSummaryItemLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255, 255, 255, 0.8)",
  display: "block",
  marginBottom: 4
};

const costsSummaryItemValue = {
  fontSize: 20,
  fontWeight: 800,
  color: "white"
};

const smallInput = {
  padding: 12,
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  textAlign: "center",
  fontSize: 14,
  fontWeight: 600,
  color: "#1e293b",
  transition: "all 0.2s ease"
};

const editBtn = {
  padding: "10px 16px",
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
  color: "#0f172a"
};

const deleteBtn = {
  padding: "10px 16px",
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  color: "#dc2626",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600
};

const smallActions = { display: "flex", gap: 10, marginTop: 16 };

const tinyEditBtn = {
  flex: 1,
  padding: "10px",
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  border: "none",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  color: "#0f172a"
};

const tinyDeleteBtn = {
  flex: 1,
  padding: "10px",
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  color: "#dc2626",
  border: "none",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer"
};

/* Search & Filter Styles */
const searchBar = {
  display: "flex",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap"
};

const searchInputWrapper = {
  flex: 1,
  minWidth: 280,
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const searchIcon = {
  position: "absolute",
  left: 14,
  color: "#94a3b8",
  pointerEvents: "none"
};

const searchInput = {
  width: "100%",
  padding: "12px 12px 12px 44",
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  fontSize: 15,
  fontWeight: 500,
  color: "#0f172a",
  outline: "none",
  transition: "all 0.2s ease"
};

const filterButton = {
  padding: "12px 20px",
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  fontWeight: 700,
  color: "#0f172a",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  transition: "all 0.2s ease"
};

const filterPanel = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 18,
  padding: 20,
  marginBottom: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 16
};

const filterGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 8
};

const filterLabel = {
  fontSize: 13,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 0.5
};

const filterInput = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  background: "white",
  fontSize: 14,
  fontWeight: 500,
  color: "#0f172a",
  outline: "none",
  transition: "all 0.2s ease"
};

const clearFiltersBtn = {
  padding: "10px 20px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  fontWeight: 700,
  color: "#0f172a",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

/* Modal Styles */
const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.75)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20
};

const modal = {
  background: "white",
  borderRadius: 28,
  padding: 36,
  width: "100%",
  maxWidth: 500,
  boxShadow: "0 32px 64px rgba(0, 0, 0, 0.25)",
  maxHeight: "90vh",
  overflowY: "auto"
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 28
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: 8,
  borderRadius: 12,
  transition: "all 0.2s ease"
};

const modalInput = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: 16,
  border: "2px solid #e2e8f0",
  marginBottom: 12,
  fontSize: 16,
  fontWeight: 500,
  color: "#1e293b",
  boxSizing: "border-box",
  transition: "all 0.2s ease"
};

const modalRow = { display: "flex", gap: 16 };

const label = {
  fontSize: 14,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 8,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.5
};

const primaryBtn = {
  width: "100%",
  padding: "18px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 16,
  fontSize: 17,
  fontWeight: 800,
  marginTop: 24,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
  transition: "all 0.3s ease"
};