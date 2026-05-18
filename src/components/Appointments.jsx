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

  // Haus sicher finden
  const selectedHouse = houses.find(
    (h) => String(h.id) === String(houseId)
  );

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
      apartment_id: apartmentId
        ? String(apartmentId)
        : null,
      date,
      time: time || "00:00",
      description,
    };

    if (editingId) {
      await setAppointments(
        appointments.map((a) =>
          String(a.id) === String(editingId)
            ? newAppointment
            : a
        )
      );

      setEditingId(null);
    } else {
      await setAppointments([
        newAppointment,
        ...appointments,
      ]);
    }

    // Reset
    setHouseId("");
    setApartmentId("");
    setDate("");
    setTime("");
    setDescription("");
  };

  const startEdit = (appointment) => {
    const house = houses.find(
      (h) =>
        String(h.id) ===
        String(appointment.house_id)
    );

    setHouseId(house ? house.id : "");
    setApartmentId(
      appointment.apartment_id || ""
    );
    setDate(appointment.date);
    setTime(appointment.time || "");
    setDescription(
      appointment.description || ""
    );
    setEditingId(appointment.id);
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Termin wirklich löschen?")) {
      return;
    }

    await setAppointments(
      appointments.filter(
        (a) => String(a.id) !== String(id)
      )
    );
  };

  return (
    <div>
      <h2
        style={{
          marginBottom: "25px",
          color: "#0A2540",
          fontSize: "28px",
        }}
      >
        📅 Termine & Besichtigungen
      </h2>

      {/* Formular */}
      <div
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          marginBottom: "40px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#0A2540",
          }}
        >
          Termin eintragen
        </h3>

        {/* Haus */}
        <select
          value={houseId}
          onChange={(e) =>
            setHouseId(e.target.value)
          }
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
            background: "#f8fafc",
          }}
        >
          <option value="">
            Haus auswählen...
          </option>

          {houses.map((house) => (
            <option
              key={house.id}
              value={house.id}
            >
              {house.name}
            </option>
          ))}
        </select>

        {/* Wohnung */}
        {selectedHouse &&
          selectedHouse.apartments &&
          selectedHouse.apartments.length >
            0 && (
            <select
              value={apartmentId}
              onChange={(e) =>
                setApartmentId(e.target.value)
              }
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "24px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                fontSize: "16px",
                background: "#f8fafc",
              }}
            >
              <option value="">
                Wohnung auswählen...
              </option>

              {selectedHouse.apartments.map(
                (apt) => (
                  <option
                    key={apt.id}
                    value={apt.id}
                  >
                    {apt.name} – {apt.tenant}
                  </option>
                )
              )}
            </select>
          )}

        {/* Datum + Uhrzeit */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              fontSize: "16px",
            }}
          />

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              fontSize: "16px",
            }}
          />
        </div>

        {/* Beschreibung */}
        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Beschreibung..."
          style={{
            width: "100%",
            height: "120px",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
            resize: "vertical",
          }}
        />

        <button
          onClick={addOrUpdateAppointment}
          style={{
            marginTop: "20px",
            padding: "16px 32px",
            background: "#0A2540",
            color: "white",
            border: "none",
            borderRadius: "14px",
            width: "100%",
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {editingId
            ? "Termin aktualisieren"
            : "Termin speichern"}
        </button>
      </div>

      {/* Liste */}
      <h3
        style={{
          marginBottom: "20px",
          color: "#0A2540",
        }}
      >
        Alle Termine ({appointments.length})
      </h3>

      {appointments.length === 0 ? (
        <p
          style={{
            color: "#666",
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          Noch keine Termine vorhanden.
        </p>
      ) : (
        appointments
          .sort(
            (a, b) =>
              new Date(a.date) -
              new Date(b.date)
          )
          .map((appointment) => (
            <div
              key={appointment.id}
              style={{
                background: "white",
                padding: "24px",
                marginBottom: "16px",
                borderRadius: "18px",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: "18px",
                    }}
                  >
                    {appointment.date}

                    {appointment.time &&
                      appointment.time !==
                        "00:00" &&
                      ` • ${appointment.time}`}
                  </strong>

                  <br />

                  <span
                    style={{
                      color: "#555",
                    }}
                  >
                    {houses.find(
                      (h) =>
                        String(h.id) ===
                        String(
                          appointment.house_id
                        )
                    )?.name || "—"}
                  </span>

                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "#333",
                    }}
                  >
                    {
                      appointment.description
                    }
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() =>
                      startEdit(appointment)
                    }
                    style={{
                      padding: "8px 16px",
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "15px",
                    }}
                  >
                    Bearbeiten
                  </button>

                  <button
                    onClick={() =>
                      deleteAppointment(
                        appointment.id
                      )
                    }
                    style={{
                      padding: "8px 16px",
                      background: "#fee2e2",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "15px",
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );
}