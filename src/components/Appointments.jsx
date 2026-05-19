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
  Save
} from "lucide-react";

export default function Appointments() {
  const { houses, appointments, setAppointments } = useImmo();

  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const selectedHouse = houses.find(
    (h) => String(h.id) === String(houseId)
  );

  useEffect(() => {
    setApartmentId("");
  }, [houseId]);

  // =========================
  // ADD / UPDATE
  // =========================
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

    setHouseId("");
    setApartmentId("");
    setDate("");
    setTime("");
    setDescription("");
  };

  const startEdit = (appointment) => {
    const house = houses.find(
      (h) => String(h.id) === String(appointment.house_id)
    );

    setHouseId(house ? house.id : "");
    setApartmentId(appointment.apartment_id || "");
    setDate(appointment.date);
    setTime(appointment.time || "");
    setDescription(appointment.description || "");
    setEditingId(appointment.id);
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Termin wirklich löschen?")) return;

    await setAppointments(
      appointments.filter((a) => String(a.id) !== String(id))
    );
  };

  return (
    <div style={page}>
      <div style={container}>

        {/* =========================
            HEADER (UNIFIED SAAS STYLE)
        ========================= */}
        <div style={header}>
          <div style={headerIcon}>
            <Calendar size={30} />
          </div>

          <h1 style={title}>Termine & Besichtigungen</h1>
          <p style={subtitle}>Alle Termine sauber organisiert im Überblick</p>
        </div>

        {/* FORM CARD */}
        <div style={card}>
          <h3 style={cardTitle}>
            <Plus size={18} />
            Neuen Termin erstellen
          </h3>

          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            style={input}
          >
            <option value="">Haus auswählen...</option>
            {houses.map((house) => (
              <option key={house.id} value={house.id}>
                {house.name}
              </option>
            ))}
          </select>

          {selectedHouse?.apartments?.length > 0 && (
            <select
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              style={input}
            >
              <option value="">Wohnung auswählen...</option>
              {selectedHouse.apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.name} – {apt.tenant}
                </option>
              ))}
            </select>
          )}

          <div style={row}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={input}
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={input}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung des Termins..."
            style={textarea}
          />

          <button onClick={addOrUpdateAppointment} style={primaryBtn}>
            <Save size={18} />
            {editingId ? "Termin aktualisieren" : "Termin speichern"}
          </button>
        </div>

        {/* LIST HEADER */}
        <h3 style={listTitle}>
          Alle Termine ({appointments.length})
        </h3>

        {/* LIST */}
        {appointments.length === 0 ? (
          <p style={empty}>Noch keine Termine vorhanden.</p>
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

                  <div style={meta}>
                    {houses.find((h) => String(h.id) === String(appointment.house_id))?.name || "—"}
                  </div>

                  <p style={desc}>{appointment.description}</p>
                </div>

                <div style={actions}>
                  <button onClick={() => startEdit(appointment)} style={iconBtn}>
                    <Edit size={18} />
                  </button>

                  <button onClick={() => deleteAppointment(appointment.id)} style={iconBtnDanger}>
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
   SAAS STYLE (UNIFIED)
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

/* HEADER */
const header = {
  textAlign: "center",
  marginBottom: 32,
};

const headerIcon = {
  width: 64,
  height: 64,
  margin: "0 auto 12px",
  borderRadius: 16,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  margin: 0,
};

const subtitle = {
  color: "#64748b",
  marginTop: 6,
};

/* CARD */
const card = {
  background: "white",
  padding: 28,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  marginBottom: 28,
};

const cardTitle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 18,
  fontSize: 18,
  fontWeight: 700,
};

/* FORM */
const input = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 15,
  background: "white",
};

const textarea = {
  width: "100%",
  height: 120,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 15,
  marginBottom: 16,
  resize: "vertical",
};

const row = {
  display: "flex",
  gap: 12,
};

/* BUTTON */
const primaryBtn = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#0A2540",
  color: "white",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
};

/* LIST */
const listTitle = {
  marginBottom: 16,
  fontSize: 18,
  fontWeight: 700,
};

const empty = {
  textAlign: "center",
  color: "#64748b",
  padding: 60,
};

const appointmentCard = {
  background: "white",
  padding: 22,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 12,
};

const meta = {
  color: "#64748b",
  marginTop: 6,
};

const desc = {
  marginTop: 10,
  color: "#0f172a",
};

const actions = {
  display: "flex",
  gap: 8,
};

const iconBtn = {
  padding: 8,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  cursor: "pointer",
};

const iconBtnDanger = {
  ...iconBtn,
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  color: "#ef4444",
};