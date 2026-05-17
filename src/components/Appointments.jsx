import { useState, useEffect } from "react";
import { useImmo } from "../context/ImmoContext";

export default function Appointments() {
  const { houses, appointments, setAppointments } = useImmo();

  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // FIX: kein Number()
  const selectedHouse = houses.find(h => h.id === houseId);

  useEffect(() => {
    setApartmentId("");
  }, [houseId]);

  const addOrUpdateAppointment = () => {
    if (!houseId || !date || !description) {
      alert("Bitte Haus, Datum und Beschreibung ausfüllen!");
      return;
    }

    const newApt = {
      id: editingId || crypto.randomUUID(),

      // FIX: DB kompatibel
      house_id: houseId,
      apartment_id: apartmentId || null,

      date,
      time: time || "00:00",
      description
    };

    if (editingId) {
      setAppointments(
        appointments.map(a => a.id === editingId ? newApt : a)
      );
      setEditingId(null);
    } else {
      setAppointments([newApt, ...appointments]);
    }

    setHouseId("");
    setApartmentId("");
    setDate("");
    setTime("");
    setDescription("");
  };

  const startEdit = (apt) => {
    const house = houses.find(h => h.name === apt.houseName);
    setHouseId(house ? house.id : "");
    setApartmentId("");
    setDate(apt.date);
    setTime(apt.time);
    setDescription(apt.description);
    setEditingId(apt.id);
  };

  const deleteAppointment = (id) => {
    if (window.confirm("Termin wirklich löschen?")) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  return (
    <div>
      <h2>📅 Termine & Besichtigungen</h2>

      <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: 30 }}>
        <h3>Neuen Termin eintragen</h3>

        <select
          value={houseId}
          onChange={e => setHouseId(e.target.value)}
          style={{ width: "100%", padding: 14, marginBottom: 12, borderRadius: 8 }}
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
            style={{ width: "100%", padding: 14, marginBottom: 20, borderRadius: 8 }}
          >
            <option value="">Wohnung auswählen...</option>
            {selectedHouse.apartments.map(apt => (
              <option key={apt.id} value={apt.id}>
                {apt.name} – {apt.tenant}
              </option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 15 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: 14, borderRadius: 8 }} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1, padding: 14, borderRadius: 8 }} />
        </div>

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Beschreibung..."
          style={{ width: "100%", height: 90, padding: 14, borderRadius: 8, marginBottom: 20 }}
        />

        <button
          onClick={addOrUpdateAppointment}
          style={{ padding: "14px 30px", background: "#007bff", color: "white", border: "none", borderRadius: 8, width: "100%", fontSize: 16 }}
        >
          {editingId ? "Termin aktualisieren" : "Termin speichern"}
        </button>
      </div>

      <h3>Alle Termine ({appointments.length})</h3>

      {appointments.length === 0 ? (
        <p style={{ color: "#666" }}>Noch keine Termine vorhanden.</p>
      ) : (
        appointments
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(apt => (
            <div
              key={apt.id}
              style={{
                background: "white",
                padding: 20,
                marginBottom: 15,
                borderRadius: 12,
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
              }}
            >
              <strong>{apt.date} {apt.time !== "00:00" && `um ${apt.time}`}</strong><br />
              <strong>{apt.houseName || apt.house_id}</strong><br />
              {apt.description}

              <div style={{ marginTop: 12 }}>
                <button onClick={() => startEdit(apt)} style={{ marginRight: 12 }}>
                  Bearbeiten
                </button>
                <button onClick={() => deleteAppointment(apt.id)} style={{ color: "red" }}>
                  Löschen
                </button>
              </div>
            </div>
          ))
      )}
    </div>
  );
}