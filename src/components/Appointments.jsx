import { useState, useEffect } from "react";
import { useImmo } from "../context/ImmoContext";
import {
  Calendar,
  Home,
  Building2,
  Clock,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

export default function Appointments() {
  const { houses, appointments, setAppointments } = useImmo();

  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Formular ein-/ausklappen
  const [showForm, setShowForm] = useState(false);

  const selectedHouse = houses.find((h) => String(h.id) === String(houseId));

  useEffect(() => {
    setApartmentId("");
  }, [houseId]);

  const addOrUpdateAppointment = async () => {
    if (!houseId || !date || !description) {
      alert("Bitte Haus, Datum und Beschreibung ausfüllen!");
      return;
    }

    const newAppointment = {
      id: editingId || crypto.randomUUID(),
      house_id: String(houseId),
      apartment_id: apartmentId ? String(apartmentId) : null,
      date,
      time: time || "00:00",
      description,
    };

    if (editingId) {
      await setAppointments(
        appointments.map((a) =>
          String(a.id) === String(editingId) ? newAppointment : a
        )
      );
      setEditingId(null);
    } else {
      await setAppointments([newAppointment, ...appointments]);
    }

    setShowForm(false);
    setHouseId("");
    setApartmentId("");
    setDate("");
    setTime("");
    setDescription("");
  };

  const startEdit = (appointment) => {
    const house = houses.find((h) => String(h.id) === String(appointment.house_id));
    setHouseId(house ? house.id : "");
    setApartmentId(appointment.apartment_id || "");
    setDate(appointment.date);
    setTime(appointment.time || "");
    setDescription(appointment.description || "");
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Termin wirklich löschen?")) return;
    await setAppointments(appointments.filter((a) => String(a.id) !== String(id)));
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <Calendar size={32} />
            <h1 style={title}>Termine & Besichtigungen</h1>
          </div>
          <p style={subtitle}>Alle Termine auf einen Blick</p>
        </div>

        {/* Toggle Button für Formular */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={toggleBtn}
        >
          <Plus size={20} />
          {showForm ? "Formular schließen" : "Neuen Termin eintragen"}
        </button>

        {/* Formular (eingeklappt) */}
        {showForm && (
          <div style={card}>
            <h3 style={formTitle}>Neuen Termin eintragen</h3>

            <select value={houseId} onChange={(e) => setHouseId(e.target.value)} style={input}>
              <option value="">Haus auswählen...</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>

            {selectedHouse && selectedHouse.apartments?.length > 0 && (
              <select value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} style={input}>
                <option value="">Wohnung auswählen...</option>
                {selectedHouse.apartments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.name} – {apt.tenant}
                  </option>
                ))}
              </select>
            )}

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={input} />
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung des Termins..."
              style={textarea}
            />

            <button onClick={addOrUpdateAppointment} style={primaryBtn}>
              {editingId ? "Termin aktualisieren" : "Termin speichern"}
            </button>
          </div>
        )}

        {/* Termine Liste */}
        <h3 style={{ marginBottom: 20, color: "#0f172a" }}>
          Alle Termine ({appointments.length})
        </h3>

        {appointments.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "60px 0" }}>
            Noch keine Termine vorhanden.
          </p>
        ) : (
          appointments
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((appointment) => (
              <div key={appointment.id} style={appointmentCard}>
                <div>
                  <strong style={{ fontSize: 18 }}>
                    {appointment.date}
                    {appointment.time && appointment.time !== "00:00" && ` • ${appointment.time}`}
                  </strong>
                  <br />
                  <span style={{ color: "#64748b" }}>
                    {houses.find((h) => String(h.id) === String(appointment.house_id))?.name || "—"}
                  </span>
                  <p style={{ margin: "12px 0 0", color: "#0f172a" }}>
                    {appointment.description}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(appointment)} style={editBtn}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteAppointment(appointment.id)} style={deleteBtn}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE
========================= */
const page = { 
  minHeight: "100vh", 
  padding: 20, 
  background: "#f6f7fb", 
  fontFamily: "Inter, Arial", 
  color: "#0f172a" 
};

const container = { maxWidth: 1100, margin: "0 auto" };

const header = { marginBottom: 30, textAlign: "center" };
const title = { fontSize: 34, fontWeight: 800, marginBottom: 4 };
const subtitle = { fontSize: 16, color: "#64748b" };

const card = {
  background: "white",
  padding: 28,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  marginBottom: 32,
};

const formTitle = { marginTop: 0, marginBottom: 24, color: "#0f172a", fontSize: 20, fontWeight: 600 };

const input = {
  width: "100%",
  padding: 16,
  marginBottom: 16,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  background: "white",
};

const textarea = {
  width: "100%",
  height: 140,
  padding: 16,
  marginBottom: 24,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  resize: "vertical",
  background: "white",
};

const primaryBtn = {
  width: "100%",
  padding: 16,
  background: "#0A2540",        // richtig schwarz
  color: "white",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer",
};

const toggleBtn = {
  width: "100%",
  padding: 16,
  background: "#0A2540",        // richtig schwarz
  color: "white",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  fontWeight: 600,
  marginBottom: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  cursor: "pointer",
};

const appointmentCard = {
  background: "white",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
};

const editBtn = { 
  padding: "8px 14px", 
  background: "#f1f5f9", 
  border: "none", 
  borderRadius: 10, 
  cursor: "pointer" 
};

const deleteBtn = { 
  padding: "8px 14px", 
  background: "#fee2e2", 
  color: "#ef4444", 
  border: "none", 
  borderRadius: 10, 
  cursor: "pointer" 
};