import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { dataService } from "./services/dataService";

// Standardwerte für die Nebenkosten
const defaultCosts = {
  Strom: { month: 0, quarter: 0, year: 0 },
  Gas: { month: 0, quarter: 0, year: 0 },
  Wasser: { month: 0, quarter: 0, year: 0 },
  Muell: { month: 0, quarter: 0, year: 0 },
  Grundsteuer: { month: 0, quarter: 0, year: 0 },
  Gebaeudeversicherung: { month: 0, quarter: 0, year: 0 },
  Haftpflicht: { month: 0, quarter: 0, year: 0 },
  Schornsteinfeger: { month: 0, quarter: 0, year: 0 },
  Gartenpflege: { month: 0, quarter: 0, year: 0 },
  Sonstiges: { month: 0, quarter: 0, year: 0 }
};

export default function App() {
  // ==================== STATES mit dataService ====================
  const [houses, setHouses] = useState(dataService.getHouses);
  const [appointments, setAppointments] = useState(dataService.getAppointments);
  const [transactions, setTransactions] = useState(dataService.getTransactions);
  const [vermieter, setVermieter] = useState(dataService.getVermieter);

  const [currentPage, setCurrentPage] = useState("dashboard");

  // House Form
  const [houseName, setHouseName] = useState("");
  const [editHouseId, setEditHouseId] = useState(null);

  // Apartment Form
  const [selectedHouseForApt, setSelectedHouseForApt] = useState(null);
  const [editingApartment, setEditingApartment] = useState(null);
  const [name, setName] = useState("");
  const [tenant, setTenant] = useState("");
  const [kaltmiete, setKaltmiete] = useState("");
  const [warmmiete, setWarmmiete] = useState("");
  const [deposit, setDeposit] = useState("");
  const [aptNotes, setAptNotes] = useState("");

  // Tenancy Form
  const [tenancyStart, setTenancyStart] = useState("");
  const [tenancyEnd, setTenancyEnd] = useState("");

  // Appointment Form
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentDescription, setAppointmentDescription] = useState("");

  const [openCostsHouse, setOpenCostsHouse] = useState({});

  // Abrechnung
  const [abrechnungHouseId, setAbrechnungHouseId] = useState(null);
  const [abrechnungApartmentId, setAbrechnungApartmentId] = useState(null);
  const [abrechnungStartDate, setAbrechnungStartDate] = useState("");
  const [abrechnungEndDate, setAbrechnungEndDate] = useState("");
  const [abrechnungShare, setAbrechnungShare] = useState(100);

  // Finance Form
  const [financeHouseId, setFinanceHouseId] = useState(null);
  const [financeApartmentId, setFinanceApartmentId] = useState(null);
  const [financeType, setFinanceType] = useState("income");
  const [financeAmount, setFinanceAmount] = useState("");
  const [financeDescription, setFinanceDescription] = useState("");
  const [financeDate, setFinanceDate] = useState("");

  // ==================== AUTOMATISCHES SPEICHERN ====================
  useEffect(() => {
    dataService.saveHouses(houses);
    dataService.saveAppointments(appointments);
    dataService.saveTransactions(transactions);
    dataService.saveVermieter(vermieter);
  }, [houses, appointments, transactions, vermieter]);

  // ==================== CALCULATIONS ====================
  const totalSummary = () => {
    let totalKalt = 0, totalWarm = 0, totalKostenMonat = 0, totalKostenQuartal = 0, totalKostenJahr = 0;
    houses.forEach(house => {
      const kalt = house.apartments.reduce((s, a) => s + (a.kaltmiete || 0), 0);
      const warm = house.apartments.reduce((s, a) => s + (a.warmmiete || 0), 0);
      const costs = house.costs || {};
      const monat = Object.values(costs).reduce((sum, c) => sum + (c.month || 0), 0);
      const quartal = Object.values(costs).reduce((sum, c) => sum + (c.quarter || 0), 0);
      const jahr = Object.values(costs).reduce((sum, c) => sum + (c.year || 0), 0);
      totalKalt += kalt;
      totalWarm += warm;
      totalKostenMonat += monat;
      totalKostenQuartal += quartal;
      totalKostenJahr += jahr;
    });
    return {
      kalt: totalKalt,
      warm: totalWarm,
      kostenMonat: totalKostenMonat,
      kostenQuartal: totalKostenQuartal,
      kostenJahr: totalKostenJahr,
      ergebnis: (totalWarm * 12) - totalKostenJahr
    };
  };

  function calcCostTotals(h) {
    let month = 0, quarter = 0, year = 0;
    Object.values(h.costs || {}).forEach((c) => {
      month += c.month || 0;
      quarter += c.quarter || 0;
      year += c.year || 0;
    });
    return { month, quarter, year };
  }

  function calcHouse(h) {
    const kalt = h.apartments.reduce((s, a) => s + (a.kaltmiete || 0), 0);
    const warm = h.apartments.reduce((s, a) => s + (a.warmmiete || 0), 0);
    const kostenJahr = Object.values(h.costs || {}).reduce((sum, c) => sum + (c.year || 0), 0);
    return {
      kalt, warm, vorauszahlungJahr: warm * 12, kosten: kostenJahr,
      ergebnis: warm * 12 - kostenJahr
    };
  }

  function calculatePreciseAbrechnung(houseId, apartmentId, startDateStr, endDateStr, sharePercent) {
    const house = houses.find(h => h.id === houseId);
    if (!house || !startDateStr || !endDateStr) return null;
    const apartment = house.apartments.find(a => a.id === apartmentId);
    if (!apartment) return null;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const days = Math.round((end - start) / (86400000)) + 1;
    const totalYearCosts = Object.values(house.costs || {}).reduce((sum, c) => sum + (c.year || 0), 0);
    const daily = totalYearCosts / 365;
    const finalAmount = (daily * days) * (sharePercent / 100);
    return {
      apartmentName: apartment.name,
      tenant: apartment.tenant,
      houseName: house.name,
      warmmiete: apartment.warmmiete || 0,
      periodStart: startDateStr,
      periodEnd: endDateStr,
      days,
      sharePercent,
      totalCostsForPeriod: finalAmount.toFixed(2)
    };
  };

  const financeSummary = () => {
    let income = 0, expense = 0;
    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  };

  // ==================== PDF ====================
  const generatePDF = () => {
    if (!abrechnungResult) {
      alert("Bitte zuerst eine Abrechnung berechnen!");
      return;
    }
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(10);
    doc.text(vermieter.name || "Vermieter", 20, y); y += 5;
    doc.text(`${vermieter.adresse || ""} ${vermieter.plz || ""} ${vermieter.ort || ""}`, 20, y); y += 15;
    doc.setFontSize(16);
    doc.text("NEBENKOSTENABRECHNUNG", 20, y); y += 15;
    doc.setFontSize(11);
    doc.text(`Abrechnungszeitraum: ${abrechnungResult.periodStart} bis ${abrechnungResult.periodEnd}`, 20, y); y += 10;
    doc.text(`Mietobjekt: ${abrechnungResult.houseName}`, 20, y); y += 8;
    doc.text(`Wohnung: ${abrechnungResult.apartmentName}`, 20, y); y += 8;
    doc.text(`Mieter: ${abrechnungResult.tenant}`, 20, y); y += 10;
    doc.text(`Monatliche Warmmiete / Vorauszahlung: ${abrechnungResult.warmmiete} €`, 20, y); y += 15;
    doc.text(`Verteilerschlüssel: ${abrechnungResult.sharePercent}%`, 20, y); y += 15;

    const costNames = {
      Grundsteuer: "Grundsteuer", Wasser: "Wasser / Abwasser", Gas: "Heizung / Gas",
      Strom: "Strom (Allgemein)", Muell: "Müllabfuhr", Gebaeudeversicherung: "Gebäudeversicherung",
      Haftpflicht: "Haftpflichtversicherung", Schornsteinfeger: "Schornsteinfeger",
      Gartenpflege: "Gartenpflege", Sonstiges: "Sonstige Kosten"
    };

    let totalPeriod = 0;
    const house = houses.find(h => h.id === abrechnungHouseId);
    Object.keys(defaultCosts).forEach(key => {
      const yearCost = house?.costs?.[key]?.year || 0;
      const daily = yearCost / 365;
      const cost = (daily * abrechnungResult.days) * (abrechnungResult.sharePercent / 100);
      totalPeriod += cost;
      doc.text(costNames[key] || key, 20, y);
      doc.text(cost.toFixed(2) + " €", 130, y);
      y += 9;
    });

    y += 12;
    doc.setFontSize(13);
    doc.text(`Anteil Mieter (${abrechnungResult.sharePercent}%): ${totalPeriod.toFixed(2)} €`, 20, y);
    y += 20;
    doc.setFontSize(11);
    doc.text("Vorauszahlungen des Mieters", 20, y); y += 10;
    doc.text(`Monatliche Warmmiete: ${abrechnungResult.warmmiete} €`, 20, y); y += 15;
    doc.text("Abrechnungsergebnis", 20, y); y += 10;
    doc.text("☐ Guthaben des Mieters: __________________ €", 20, y); y += 8;
    doc.text("☐ Nachzahlung des Mieters: ________________ €", 20, y);
    y += 25;
    doc.text(`Ort, Datum: __________________________`, 20, y); y += 15;
    doc.text(`(${vermieter.name || "Vermieter"})`, 20, y);
    doc.save(`Nebenkostenabrechnung_${abrechnungResult.apartmentName || "Mieter"}.pdf`);
  };

  // ==================== CRUD ====================
  function addHouse() {
    if (!houseName) return;
    if (editHouseId) {
      setHouses(houses.map(h => h.id === editHouseId ? { ...h, name: houseName } : h));
      setEditHouseId(null);
    } else {
      setHouses([...houses, {
        id: Date.now(),
        name: houseName,
        apartments: [],
        costs: JSON.parse(JSON.stringify(defaultCosts))
      }]);
    }
    setHouseName("");
  }

  function editHouse(h) {
    setEditHouseId(h.id);
    setHouseName(h.name);
  }

  function deleteHouse(id) {
    setHouses(houses.filter(h => h.id !== id));
  }

  function addOrEditApartment(houseId) {
    if (!name || !tenant || !kaltmiete || !warmmiete) return;
    const newApt = {
      id: editingApartment ? editingApartment.id : Date.now(),
      name,
      tenant,
      kaltmiete: Number(kaltmiete),
      warmmiete: Number(warmmiete),
      deposit: Number(deposit) || 0,
      notes: aptNotes,
      tenancies: editingApartment?.tenancies || []
    };
    if (tenancyStart) {
      newApt.tenancies.push({
        start: tenancyStart,
        end: tenancyEnd || null,
        tenant: tenant
      });
    }
    setHouses(houses.map(h => {
      if (h.id !== houseId) return h;
      if (editingApartment) {
        return { ...h, apartments: h.apartments.map(a => a.id === editingApartment.id ? newApt : a) };
      }
      return { ...h, apartments: [...h.apartments, newApt] };
    }));
    resetApartmentForm();
  }

  function resetApartmentForm() {
    setName(""); setTenant(""); setKaltmiete(""); setWarmmiete("");
    setDeposit(""); setAptNotes(""); setTenancyStart(""); setTenancyEnd("");
    setEditingApartment(null);
  }

  function startEditApartment(house, apt) {
    setSelectedHouseForApt(house);
    setEditingApartment(apt);
    setName(apt.name);
    setTenant(apt.tenant);
    setKaltmiete(apt.kaltmiete);
    setWarmmiete(apt.warmmiete);
    setDeposit(apt.deposit || "");
    setAptNotes(apt.notes || "");
  }

  function deleteApartment(houseId, aptId) {
    if (window.confirm("Wohnung wirklich löschen?")) {
      setHouses(houses.map(h =>
        h.id === houseId ? { ...h, apartments: h.apartments.filter(a => a.id !== aptId) } : h
      ));
    }
  }

  function toggleCosts(id) {
    setOpenCostsHouse(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function updateCosts(houseId, field, type, value) {
    const val = Number(value) || 0;
    setHouses(houses.map(h => {
      if (h.id !== houseId) return h;
      const updated = { ...h.costs };
      if (type === "month") {
        updated[field] = { month: val, quarter: val * 3, year: val * 12 };
      } else if (type === "quarter") {
        updated[field] = { month: val / 3, quarter: val, year: val * 4 };
      } else if (type === "year") {
        updated[field] = { month: val / 12, quarter: val / 4, year: val };
      }
      return { ...h, costs: updated };
    }));
  }

  function addAppointment() {
    if (!appointmentTitle || !appointmentDate || !selectedHouse) {
      alert("Bitte Haus, Titel und Datum auswählen!");
      return;
    }
    const newAppointment = {
      id: Date.now(),
      houseId: selectedHouse.id,
      apartmentId: selectedApartment ? selectedApartment.id : null,
      title: appointmentTitle,
      date: appointmentDate,
      description: appointmentDescription,
    };
    setAppointments([...appointments, newAppointment]);
    setAppointmentTitle("");
    setAppointmentDate("");
    setAppointmentDescription("");
    setSelectedApartment(null);
  }

  function deleteAppointment(id) {
    if (window.confirm("Termin wirklich löschen?")) {
      setAppointments(appointments.filter(app => app.id !== id));
    }
  }

  function getAllAppointmentsWithDetails() {
    return appointments.map(app => {
      const house = houses.find(h => h.id === app.houseId);
      const apartment = house?.apartments?.find(a => a.id === app.apartmentId);
      return {
        ...app,
        houseName: house?.name || "Unbekanntes Haus",
        apartmentName: apartment?.name || "Keine Wohnung"
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function addTransaction() {
    if (!financeHouseId || !financeAmount || !financeDescription) {
      alert("Bitte Haus, Betrag und Beschreibung angeben!");
      return;
    }
    const newTrans = {
      id: Date.now(),
      houseId: financeHouseId,
      apartmentId: financeApartmentId || null,
      type: financeType,
      amount: Number(financeAmount),
      description: financeDescription,
      date: financeDate || new Date().toISOString().split('T')[0]
    };
    setTransactions([...transactions, newTrans]);
    setFinanceAmount("");
    setFinanceDescription("");
    setFinanceDate("");
  }

  // ==================== BERECHNUNGEN FÜR ANZEIGE ====================
  const summary = totalSummary();
  const financeData = financeSummary();

  const selectedAbrechnungHouse = houses.find(h => h.id === abrechnungHouseId);
  const abrechnungResult = calculatePreciseAbrechnung(
    abrechnungHouseId,
    abrechnungApartmentId,
    abrechnungStartDate,
    abrechnungEndDate,
    abrechnungShare
  );

  return (
    <div style={{ padding: 20, fontFamily: "Arial", background: "#f5f7fa", minHeight: "100vh" }}>
      <h1 style={{ color: "#1e3a8a" }}>🏠 Immo Dashboard</h1>

      {/* Navigation */}
      <div style={{
        backgroundColor: "white",
        padding: "12px 0",
        marginBottom: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        gap: "15px",
        flexWrap: "wrap"
      }}>
        <button onClick={() => setCurrentPage("dashboard")} style={{ padding: "10px 18px", fontWeight: currentPage === "dashboard" ? "bold" : "normal", borderRadius: "6px" }}>📊 Dashboard</button>
        <button onClick={() => setCurrentPage("houses")} style={{ padding: "10px 18px", fontWeight: currentPage === "houses" ? "bold" : "normal", borderRadius: "6px" }}>🏠 Häuser</button>
        <button onClick={() => setCurrentPage("appointments")} style={{ padding: "10px 18px", fontWeight: currentPage === "appointments" ? "bold" : "normal", borderRadius: "6px" }}>📅 Termine</button>
        <button onClick={() => setCurrentPage("finanzen")} style={{ padding: "10px 18px", fontWeight: currentPage === "finanzen" ? "bold" : "normal", borderRadius: "6px" }}>💰 Finanzen</button>
        <button onClick={() => setCurrentPage("abrechnung")} style={{ padding: "10px 18px", fontWeight: currentPage === "abrechnung" ? "bold" : "normal", borderRadius: "6px" }}>📋 Abrechnung</button>
        <button onClick={() => setCurrentPage("einstellungen")} style={{ padding: "10px 18px", fontWeight: currentPage === "einstellungen" ? "bold" : "normal", borderRadius: "6px" }}>⚙️ Einstellungen</button>
      </div>

      {/* Dashboard */}
      {currentPage === "dashboard" && (
        <div>
          <h2>Dashboard</h2>
          <div style={{ padding: 25, background: "white", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 30 }}>
            <h3>Gesamtübersicht</h3>
            <p><strong>Kaltmiete gesamt:</strong> {summary.kalt.toFixed(2)} €</p>
            <p><strong>Warmmiete gesamt:</strong> {summary.warm.toFixed(2)} €</p>
            <p><strong>Nebenkosten:</strong> Monat {summary.kostenMonat.toFixed(2)} € | Jahr {summary.kostenJahr.toFixed(2)} €</p>
            <p style={{ fontSize: "1.5em", fontWeight: "bold", color: summary.ergebnis >= 0 ? "#16a34a" : "#ef4444" }}>
              Jahresergebnis: {summary.ergebnis >= 0 ? "+" : ""}{summary.ergebnis.toFixed(2)} €
            </p>
          </div>
          <div style={{ padding: 25, background: "white", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h3>Finanzübersicht</h3>
            <p><strong>Einnahmen:</strong> {financeData.income.toFixed(2)} €</p>
            <p><strong>Ausgaben:</strong> {financeData.expense.toFixed(2)} €</p>
            <p style={{ fontSize: "1.4em", fontWeight: "bold", color: financeData.balance >= 0 ? "#16a34a" : "#ef4444" }}>
              Saldo: {financeData.balance.toFixed(2)} €
            </p>
          </div>
        </div>
      )}

      {/* Häuser & Wohnungen */}
      {currentPage === "houses" && (
        <div>
          <h2>Häuser & Wohnungen</h2>
          <div style={{ marginBottom: 20 }}>
            <input value={houseName} onChange={e => setHouseName(e.target.value)} placeholder="Hausname" style={{ marginRight: 10, padding: 8 }} />
            <button onClick={addHouse}>{editHouseId ? "Haus speichern" : "Haus hinzufügen"}</button>
          </div>
          {houses.map((house) => {
            const r = calcHouse(house);
            const t = calcCostTotals(house);
            return (
              <div key={house.id} style={{ marginBottom: 40, border: "1px solid #ddd", padding: 20, borderRadius: 12, background: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3>🏠 {house.name}</h3>
                  <div>
                    <button onClick={() => editHouse(house)} style={{ marginRight: 8 }}>Bearbeiten</button>
                    <button onClick={() => deleteHouse(house.id)} style={{ color: "red" }}>Löschen</button>
                  </div>
                </div>
                <p>Kaltmiete: {r.kalt} € | Warmmiete: {r.warm} €</p>
                <p>Jahresergebnis: <strong style={{ color: r.ergebnis >= 0 ? "green" : "red" }}>{r.ergebnis} €</strong></p>
                <div style={{ margin: "15px 0", padding: 12, background: "#f0f7ff", borderRadius: 8 }}>
                  <strong>Nebenkosten dieses Hauses:</strong><br />
                  Monat: <strong>{t.month.toFixed(2)}</strong> € | Quartal: <strong>{t.quarter.toFixed(2)}</strong> € | Jahr: <strong>{t.year.toFixed(2)}</strong> €
                </div>
                <button onClick={() => toggleCosts(house.id)}>
                  Nebenkosten {openCostsHouse[house.id] ? "schließen" : "bearbeiten"}
                </button>
                {openCostsHouse[house.id] && (
                  <div style={{ border: "1px solid #ddd", padding: 15, marginTop: 10 }}>
                    {Object.keys(house.costs).map((key) => (
                      <div key={key} style={{ marginBottom: 15 }}>
                        <b>{key}</b>
                        <div style={{ display: "flex", gap: 10 }}>
                          <div>Monat: <input type="number" step="0.01" value={house.costs[key].month} onChange={(e) => updateCosts(house.id, key, "month", e.target.value)} /></div>
                          <div>Quartal: <input type="number" step="0.01" value={house.costs[key].quarter} onChange={(e) => updateCosts(house.id, key, "quarter", e.target.value)} /></div>
                          <div>Jahr: <input type="number" step="0.01" value={house.costs[key].year} onChange={(e) => updateCosts(house.id, key, "year", e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <h4>Wohnungen</h4>
                <div style={{ padding: 15, background: "#f9f9f9", borderRadius: 8, marginBottom: 15 }}>
                  <h5>{editingApartment ? "Wohnung bearbeiten" : "Neue Wohnung"}</h5>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Wohnungsname" style={{ marginRight: 5 }} />
                  <input value={tenant} onChange={e => setTenant(e.target.value)} placeholder="Mieter" style={{ marginRight: 5 }} />
                  <input type="number" value={kaltmiete} onChange={e => setKaltmiete(e.target.value)} placeholder="Kaltmiete" style={{ marginRight: 5, width: 110 }} />
                  <input type="number" value={warmmiete} onChange={e => setWarmmiete(e.target.value)} placeholder="Warmmiete" style={{ marginRight: 5, width: 110 }} />
                  <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="Kaution" style={{ marginRight: 5, width: 110 }} />
                  <br /><br />
                  <input type="date" value={tenancyStart} onChange={e => setTenancyStart(e.target.value)} style={{ marginRight: 5 }} /> von
                  <input type="date" value={tenancyEnd} onChange={e => setTenancyEnd(e.target.value)} style={{ marginLeft: 5 }} /> bis
                  <br /><br />
                  <textarea value={aptNotes} onChange={e => setAptNotes(e.target.value)} placeholder="Bemerkungen" rows={2} style={{ width: "100%" }} />
                  <br />
                  <button onClick={() => addOrEditApartment(house.id)}>
                    {editingApartment ? "Speichern" : "Wohnung + Mietphase hinzufügen"}
                  </button>
                  {editingApartment && <button onClick={resetApartmentForm} style={{ marginLeft: 10 }}>Abbrechen</button>}
                </div>
                <ul>
                  {house.apartments.map((apt) => (
                    <li key={apt.id} style={{ padding: 15, marginBottom: 15, background: "#f8fafc", borderRadius: 8 }}>
                      <strong>{apt.name}</strong> — {apt.tenant}<br />
                      Kalt: {apt.kaltmiete} € | Warm: {apt.warmmiete} € | Kaution: {apt.deposit || 0} €
                      <h5 style={{ marginTop: 12 }}>Miethistorie:</h5>
                      {apt.tenancies && apt.tenancies.length > 0 ? (
                        <ul>
                          {apt.tenancies.map((t, i) => (
                            <li key={i}>
                              {t.start} {t.end ? `bis ${t.end}` : "bis heute"} — {t.tenant}
                            </li>
                          ))}
                        </ul>
                      ) : <p><em>Noch keine Mietphasen.</em></p>}
                      <div style={{ marginTop: 10 }}>
                        <button onClick={() => startEditApartment(house, apt)} style={{ marginRight: 8 }}>Bearbeiten</button>
                        <button onClick={() => deleteApartment(house.id, apt.id)} style={{ color: "red" }}>Löschen</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Termine */}
      {currentPage === "appointments" && (
        <div>
          <h2>Termine</h2>
          <h4>Neuen Termin eintragen</h4>
          <select onChange={(e) => {
            const house = houses.find(h => h.id === Number(e.target.value));
            setSelectedHouse(house);
            setSelectedApartment(null);
          }}>
            <option value="">Haus auswählen</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          {selectedHouse && (
            <select onChange={(e) => {
              const apt = selectedHouse.apartments.find(a => a.id === Number(e.target.value));
              setSelectedApartment(apt || null);
            }} style={{ marginLeft: 10 }}>
              <option value="">Wohnung (optional)</option>
              {selectedHouse.apartments.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.tenant})</option>
              ))}
            </select>
          )}
          <div style={{ marginTop: 15 }}>
            <input type="text" placeholder="Titel" value={appointmentTitle} onChange={e => setAppointmentTitle(e.target.value)} style={{ marginRight: 10 }} />
            <input type="datetime-local" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
            <br /><br />
            <textarea placeholder="Beschreibung" value={appointmentDescription} onChange={e => setAppointmentDescription(e.target.value)} rows={3} style={{ width: "500px" }} />
            <br />
            <button onClick={addAppointment}>Termin hinzufügen</button>
          </div>
          <hr style={{ margin: "30px 0" }} />
          <h4>Alle Termine</h4>
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Haus</th>
                <th>Wohnung</th>
                <th>Titel</th>
                <th>Beschreibung</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {getAllAppointmentsWithDetails().map(app => (
                <tr key={app.id}>
                  <td>{new Date(app.date).toLocaleString("de-DE")}</td>
                  <td>{app.houseName}</td>
                  <td>{app.apartmentName}</td>
                  <td><strong>{app.title}</strong></td>
                  <td>{app.description}</td>
                  <td><button onClick={() => deleteAppointment(app.id)} style={{ color: "red" }}>Löschen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Finanzen */}
      {currentPage === "finanzen" && (
        <div>
          <h2>💰 Finanzmodul</h2>
          <div style={{ padding: 25, background: "white", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 30 }}>
            <h3>Gesamt-Finanzübersicht</h3>
            <p><strong>Einnahmen:</strong> {financeData.income.toFixed(2)} €</p>
            <p><strong>Ausgaben:</strong> {financeData.expense.toFixed(2)} €</p>
            <p style={{ fontSize: "1.5em", fontWeight: "bold", color: financeData.balance >= 0 ? "#16a34a" : "#ef4444" }}>
              Saldo: {financeData.balance.toFixed(2)} €
            </p>
          </div>
          <div style={{ padding: 20, background: "white", borderRadius: 12 }}>
            <h3>Neue Buchung</h3>
            <select onChange={e => setFinanceHouseId(Number(e.target.value))} style={{ marginRight: 10 }}>
              <option value="">Haus wählen</option>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select onChange={e => setFinanceApartmentId(e.target.value ? Number(e.target.value) : null)} style={{ marginRight: 10 }}>
              <option value="">Alle Wohnungen</option>
              {financeHouseId && houses.find(h => h.id === financeHouseId)?.apartments.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select value={financeType} onChange={e => setFinanceType(e.target.value)} style={{ marginRight: 10 }}>
              <option value="income">Einnahme</option>
              <option value="expense">Ausgabe</option>
            </select>
            <input type="number" value={financeAmount} onChange={e => setFinanceAmount(e.target.value)} placeholder="Betrag" style={{ marginRight: 10, width: 120 }} />
            <input type="date" value={financeDate} onChange={e => setFinanceDate(e.target.value)} style={{ marginRight: 10 }} />
            <input value={financeDescription} onChange={e => setFinanceDescription(e.target.value)} placeholder="Beschreibung" style={{ width: 300 }} />
            <br /><br />
            <button onClick={addTransaction}>Buchung hinzufügen</button>
          </div>
          <h3 style={{ marginTop: 30 }}>Alle Buchungen</h3>
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Haus</th>
                <th>Typ</th>
                <th>Beschreibung</th>
                <th>Betrag</th>
              </tr>
            </thead>
            <tbody>
              {transactions.sort((a,b) => new Date(b.date) - new Date(a.date)).map(t => {
                const house = houses.find(h => h.id === t.houseId);
                return (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{house?.name || "—"}</td>
                    <td style={{ color: t.type === "income" ? "green" : "red" }}>
                      {t.type === "income" ? "Einnahme" : "Ausgabe"}
                    </td>
                    <td>{t.description}</td>
                    <td style={{ fontWeight: "bold", color: t.type === "income" ? "green" : "red" }}>
                      {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Abrechnung */}
      {currentPage === "abrechnung" && (
        <div>
          <h2>Nebenkostenabrechnung</h2>
          <div style={{ marginBottom: 20 }}>
            <select onChange={(e) => setAbrechnungHouseId(Number(e.target.value))} style={{ marginRight: 10 }}>
              <option value="">Haus auswählen</option>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            {selectedAbrechnungHouse && (
              <select onChange={(e) => setAbrechnungApartmentId(Number(e.target.value))} style={{ marginRight: 10 }}>
                <option value="">Wohnung auswählen</option>
                {selectedAbrechnungHouse.apartments.map(apt => (
                  <option key={apt.id} value={apt.id}>{apt.name} — {apt.tenant}</option>
                ))}
              </select>
            )}
            <input type="date" value={abrechnungStartDate} onChange={e => setAbrechnungStartDate(e.target.value)} style={{ marginRight: 5 }} /> bis
            <input type="date" value={abrechnungEndDate} onChange={e => setAbrechnungEndDate(e.target.value)} style={{ marginLeft: 5, marginRight: 10 }} />
            <select value={abrechnungShare} onChange={e => setAbrechnungShare(Number(e.target.value))}>
              <option value="100">100% (Einzelmieter)</option>
              <option value="50">50% (z.B. 50/50)</option>
              <option value="33">33%</option>
              <option value="25">25%</option>
              <option value="75">75%</option>
            </select>
          </div>
          {abrechnungResult && (
            <div style={{ padding: 20, background: "#e6f7e6", borderRadius: 10 }}>
              <h3>Abrechnungsergebnis</h3>
              <p><strong>Wohnung:</strong> {abrechnungResult.apartmentName}</p>
              <p><strong>Mieter:</strong> {abrechnungResult.tenant}</p>
              <p><strong>Warmmiete / Vorauszahlung:</strong> {abrechnungResult.warmmiete} €</p>
              <p><strong>Zeitraum:</strong> {abrechnungResult.periodStart} bis {abrechnungResult.periodEnd}</p>
              <p><strong>Aufteilung:</strong> {abrechnungResult.sharePercent}%</p>
              <h3>Betrag: <strong>{abrechnungResult.totalCostsForPeriod} €</strong></h3>
              <button
                onClick={generatePDF}
                style={{ marginTop: 20, padding: "12px 24px", background: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}
              >
                📄 PDF nach Vorlage erstellen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Einstellungen */}
      {currentPage === "einstellungen" && (
        <div>
          <h2>Einstellungen</h2>
          <div style={{ maxWidth: "600px", background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h3>Persönliche Daten (für PDF)</h3>
            <input placeholder="Name" value={vermieter.name} onChange={e => setVermieter({ ...vermieter, name: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 8 }} />
            <input placeholder="Adresse" value={vermieter.adresse} onChange={e => setVermieter({ ...vermieter, adresse: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 8 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="PLZ" value={vermieter.plz} onChange={e => setVermieter({ ...vermieter, plz: e.target.value })} style={{ width: "30%", padding: 8 }} />
              <input placeholder="Ort" value={vermieter.ort} onChange={e => setVermieter({ ...vermieter, ort: e.target.value })} style={{ width: "70%", padding: 8 }} />
            </div>
            <input placeholder="Telefon" value={vermieter.telefon} onChange={e => setVermieter({ ...vermieter, telefon: e.target.value })} style={{ width: "100%", margin: "10px 0", padding: 8 }} />
            <input placeholder="E-Mail" value={vermieter.email} onChange={e => setVermieter({ ...vermieter, email: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 8 }} />
           
            <h4>Bankdaten</h4>
            <input placeholder="IBAN" value={vermieter.iban} onChange={e => setVermieter({ ...vermieter, iban: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 8 }} />
            <input placeholder="BIC" value={vermieter.bic} onChange={e => setVermieter({ ...vermieter, bic: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 8 }} />
          </div>
        </div>
      )}
    </div>
  );
}