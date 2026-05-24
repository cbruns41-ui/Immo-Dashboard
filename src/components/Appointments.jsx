import { useState, useEffect } from "react";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Calendar,
  Wrench,
  Edit,
  Trash2,
  Plus,
  Repeat,
} from "lucide-react";
import {
  APPOINTMENT_TYPES,
  MAINTENANCE_INTERVAL_OPTIONS,
  formatIntervalLabel,
  getNextMaintenanceDate,
  isMaintenanceAppointment,
  getAppointmentLabel,
  daysUntil,
} from "../utils/maintenance";

const resetFormState = () => ({
  houseId: "",
  apartmentId: "",
  date: "",
  time: "",
  description: "",
  appointmentType: "other",
  maintenanceIntervalMonths: "",
  editingId: null,
});

export default function Appointments() {
  const { houses, appointments, setAppointments } = useImmo();
  const { error: notifyError, success: notifySuccess, warning: notifyWarning } =
    useNotifications();

  const [houseId, setHouseId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [appointmentType, setAppointmentType] = useState("other");
  const [maintenanceIntervalMonths, setMaintenanceIntervalMonths] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const selectedHouse = houses.find((h) => String(h.id) === String(houseId));
  const isMaintenance = appointmentType === "maintenance";

  useEffect(() => {
    setApartmentId("");
  }, [houseId]);

  useEffect(() => {
    if (!isMaintenance) {
      setMaintenanceIntervalMonths("");
    }
  }, [isMaintenance]);

  const clearForm = () => {
    const empty = resetFormState();
    setHouseId(empty.houseId);
    setApartmentId(empty.apartmentId);
    setDate(empty.date);
    setTime(empty.time);
    setDescription(empty.description);
    setAppointmentType(empty.appointmentType);
    setMaintenanceIntervalMonths(empty.maintenanceIntervalMonths);
    setEditingId(empty.editingId);
  };

  const addOrUpdateAppointment = async () => {
    if (!houseId || !date || !description) {
      notifyWarning("Bitte Haus, Datum und Beschreibung ausfüllen.");
      return;
    }

    if (isMaintenance && !maintenanceIntervalMonths) {
      notifyWarning("Bitte ein Wartungsintervall auswählen (z. B. jährlich).");
      return;
    }

    const newAppointment = {
      id: editingId || crypto.randomUUID(),
      house_id: String(houseId),
      apartment_id: apartmentId ? String(apartmentId) : null,
      date,
      time: time || "00:00",
      description,
      appointment_type: appointmentType,
      maintenance_interval_months: isMaintenance
        ? Number(maintenanceIntervalMonths)
        : null,
    };

    let ok = false;
    if (editingId) {
      ok = await setAppointments(
        appointments.map((a) =>
          String(a.id) === String(editingId) ? newAppointment : a
        )
      );
    } else {
      ok = await setAppointments([newAppointment, ...appointments]);
    }

    if (ok === false) return;

    notifySuccess(editingId ? "Termin aktualisiert" : "Termin gespeichert");
    setShowForm(false);
    clearForm();
  };

  const startEdit = (appointment) => {
    const house = houses.find((h) => String(h.id) === String(appointment.house_id));
    setHouseId(house ? house.id : "");
    setApartmentId(appointment.apartment_id || "");
    setDate(appointment.date);
    setTime(appointment.time || "");
    setDescription(appointment.description || appointment.title || "");
    setAppointmentType(appointment.appointment_type || "other");
    setMaintenanceIntervalMonths(
      appointment.maintenance_interval_months
        ? String(appointment.maintenance_interval_months)
        : ""
    );
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Termin wirklich löschen?")) return;
    await setAppointments(appointments.filter((a) => String(a.id) !== String(id)));
  };

  const maintenanceAppointments = appointments.filter(isMaintenanceAppointment);

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <Calendar size={32} />
            <h1 style={title}>Termine & Wartung</h1>
          </div>
          <p style={subtitle}>
            Termine planen und Wartungsintervalle für das Dashboard pflegen
          </p>
        </div>

        {maintenanceAppointments.length > 0 && (
          <div style={infoCard}>
            <Wrench size={20} />
            <div>
              <strong>{maintenanceAppointments.length} Wartung(en)</strong> mit Intervall
              hinterlegt – werden im Dashboard unter „Wartungs-Verwaltung“ angezeigt.
            </div>
          </div>
        )}

        <button onClick={() => setShowForm(!showForm)} style={toggleBtn}>
          <Plus size={20} />
          {showForm ? "Formular schließen" : "Neuen Termin eintragen"}
        </button>

        {showForm && (
          <div style={card}>
            <h3 style={formTitle}>
              {editingId ? "Termin bearbeiten" : "Neuen Termin eintragen"}
            </h3>

            <label style={fieldLabel}>Terminart</label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              style={input}
            >
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select value={houseId} onChange={(e) => setHouseId(e.target.value)} style={input}>
              <option value="">Haus auswählen...</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>

            {selectedHouse && selectedHouse.apartments?.length > 0 && (
              <select
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                style={input}
              >
                <option value="">Wohnung auswählen (optional)...</option>
                {selectedHouse.apartments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.name} – {apt.tenant || "leer"}
                  </option>
                ))}
              </select>
            )}

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ ...input, marginBottom: 0 }}
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ ...input, marginBottom: 0 }}
              />
            </div>

            {isMaintenance && (
              <>
                <label style={fieldLabel}>
                  <Repeat size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Wartungsintervall
                </label>
                <select
                  value={maintenanceIntervalMonths}
                  onChange={(e) => setMaintenanceIntervalMonths(e.target.value)}
                  style={input}
                >
                  {MAINTENANCE_INTERVAL_OPTIONS.filter((o) => o.value !== "").map(
                    (option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  )}
                </select>
                {date && maintenanceIntervalMonths && (
                  <p style={hintText}>
                    Nächste Wartung voraussichtlich:{" "}
                    <strong>
                      {getNextMaintenanceDate(date, maintenanceIntervalMonths) ||
                        "—"}
                    </strong>
                  </p>
                )}
              </>
            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isMaintenance
                  ? "z. B. Heizungswartung, Aufzugskontrolle..."
                  : "Beschreibung des Termins..."
              }
              style={textarea}
            />

            <button onClick={addOrUpdateAppointment} style={primaryBtn}>
              {editingId ? "Termin aktualisieren" : "Termin speichern"}
            </button>
          </div>
        )}

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
            .map((appointment) => {
              const nextDate =
                isMaintenanceAppointment(appointment) &&
                appointment.maintenance_interval_months
                  ? getNextMaintenanceDate(
                      appointment.date,
                      appointment.maintenance_interval_months
                    )
                  : null;
              const days = daysUntil(nextDate);
              const typeLabel = APPOINTMENT_TYPES.find(
                (t) => t.value === appointment.appointment_type
              )?.label;

              return (
                <div key={appointment.id} style={appointmentCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 18 }}>
                        {appointment.date}
                        {appointment.time &&
                          appointment.time !== "00:00" &&
                          ` • ${appointment.time}`}
                      </strong>
                      {typeLabel && (
                        <span
                          style={
                            isMaintenanceAppointment(appointment)
                              ? typeBadgeMaintenance
                              : typeBadge
                          }
                        >
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <span style={{ color: "#64748b" }}>
                      {houses.find((h) => String(h.id) === String(appointment.house_id))
                        ?.name || "—"}
                    </span>
                    <p style={{ margin: "12px 0 0", color: "#0f172a" }}>
                      {getAppointmentLabel(appointment)}
                    </p>
                    {isMaintenanceAppointment(appointment) &&
                      appointment.maintenance_interval_months && (
                        <p style={intervalMeta}>
                          Intervall:{" "}
                          {formatIntervalLabel(appointment.maintenance_interval_months)}
                          {nextDate && (
                            <>
                              {" "}
                              · Nächste fällig: <strong>{nextDate}</strong>
                              {days !== null && days <= 30 && (
                                <span style={days <= 0 ? overdueBadge : soonBadge}>
                                  {days <= 0
                                    ? ` (${Math.abs(days)} T. überfällig)`
                                    : ` (in ${days} T.)`}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(appointment)} style={editBtn}>
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      style={deleteBtn}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  padding: "20px 16px 100px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a",
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
  backgroundClip: "text",
};
const subtitle = { fontSize: 16, color: "#64748b", fontWeight: 500 };

const infoCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: 16,
  marginBottom: 20,
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.95)",
  border: "2px solid #c4b5fd",
  color: "#5b21b6",
  fontSize: 14,
  lineHeight: 1.5,
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 28,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  marginBottom: 24,
};

const formTitle = {
  marginTop: 0,
  marginBottom: 24,
  color: "#1e293b",
  fontSize: 20,
  fontWeight: 700,
};

const fieldLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 8,
};

const input = {
  width: "100%",
  padding: 16,
  marginBottom: 16,
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  fontSize: 16,
  fontWeight: 500,
  color: "#1e293b",
  background: "white",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

const textarea = {
  width: "100%",
  height: 120,
  padding: 16,
  marginBottom: 24,
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  fontSize: 16,
  fontWeight: 500,
  color: "#1e293b",
  resize: "vertical",
  background: "white",
  boxSizing: "border-box",
};

const hintText = {
  margin: "-8px 0 16px",
  fontSize: 14,
  color: "#64748b",
};

const primaryBtn = {
  width: "100%",
  padding: 18,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 16,
  fontSize: 17,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
};

const toggleBtn = {
  width: "100%",
  padding: 18,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 16,
  fontSize: 17,
  fontWeight: 800,
  marginBottom: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
};

const appointmentCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 18,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
  gap: 16,
};

const typeBadge = {
  fontSize: 11,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 8,
  background: "#f1f5f9",
  color: "#475569",
};

const typeBadgeMaintenance = {
  ...typeBadge,
  background: "#ede9fe",
  color: "#6d28d9",
};

const intervalMeta = {
  margin: "8px 0 0",
  fontSize: 13,
  color: "#6d28d9",
  fontWeight: 500,
};

const soonBadge = { color: "#d97706", fontWeight: 700 };
const overdueBadge = { color: "#dc2626", fontWeight: 700 };

const editBtn = {
  padding: "10px 16px",
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  color: "#0f172a",
};

const deleteBtn = {
  padding: "10px 16px",
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  color: "#dc2626",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
};
