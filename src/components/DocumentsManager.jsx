import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useImmo } from "../context/ImmoContext";

export default function DocumentsManager() {
  const { houses } = useImmo();

  const [documents, setDocuments] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD DOCUMENTS
  // =========================
  const loadDocuments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Dokumente laden:", error);
      setLoading(false);
      return;
    }

    setDocuments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // =========================
  // DELETE DOCUMENT
  // =========================
  const deleteDocument = async (doc) => {
    const ok = confirm("Dokument wirklich löschen?");
    if (!ok) return;

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (error) {
      alert("Fehler beim Löschen");
      return;
    }

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  // =========================
  // HELPERS
  // =========================
  const getHouse = (id) => houses.find((h) => h.id === id);

  const getApartment = (houseId, aptId) => {
    const house = houses.find((h) => h.id === houseId);
    return house?.apartments?.find((a) => a.id === aptId);
  };

  // =========================
  // FILTERS
  // =========================
  const filteredDocs = documents.filter((doc) => {
    const houseMatch = selectedHouse ? doc.house_id === selectedHouse : true;
    const aptMatch = selectedApartment ? doc.apartment_id === selectedApartment : true;
    const typeMatch = selectedType ? doc.type === selectedType : true;

    return houseMatch && aptMatch && typeMatch;
  });

  // Apartments dynamisch je Haus
  const apartmentsOfSelectedHouse =
    houses.find((h) => h.id === selectedHouse)?.apartments || [];

  return (
    <div style={{ padding: "20px 15px", maxWidth: "1280px", margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{
        background: "white",
        padding: "28px 32px",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "18px"
      }}>
        <div style={{
          width: "62px",
          height: "62px",
          background: "linear-gradient(135deg, #0A2540, #00D4C8)",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px"
        }}>
          📂
        </div>

        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0A2540" }}>
            Dokumente verwalten
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            Haus- & Wohnungsdokumente strukturiert organisieren
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        marginBottom: "25px",
        display: "flex",
        gap: "15px",
        flexWrap: "wrap"
      }}>

        {/* HOUSE */}
        <select
          value={selectedHouse}
          onChange={(e) => {
            setSelectedHouse(e.target.value);
            setSelectedApartment("");
          }}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            flex: 1,
            minWidth: "200px"
          }}
        >
          <option value="">Alle Häuser</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        {/* APARTMENT */}
        <select
          value={selectedApartment}
          onChange={(e) => setSelectedApartment(e.target.value)}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            flex: 1,
            minWidth: "200px"
          }}
        >
          <option value="">Alle Wohnungen</option>
          {apartmentsOfSelectedHouse.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* TYPE */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            flex: 1,
            minWidth: "200px"
          }}
        >
          <option value="">Alle Typen</option>
          <option value="sonstiges">Sonstiges</option>
          <option value="rechnung">Rechnung</option>
          <option value="versicherung">Versicherung</option>
          <option value="reparatur">Reparatur</option>
          <option value="vertrag">Vertrag</option>
        </select>

      </div>

      {/* CONTENT */}
      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
      }}>

        {loading ? (
          <p>Lade Dokumente...</p>
        ) : filteredDocs.length === 0 ? (
          <p style={{ color: "#666" }}>Keine Dokumente gefunden</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "15px"
          }}>
            {filteredDocs.map((doc) => {
              const house = getHouse(doc.house_id);
              const apartment = getApartment(doc.house_id, doc.apartment_id);

              return (
                <div
                  key={doc.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "16px",
                    padding: "15px",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >

                  {/* IMAGE */}
                  <img
                    src={doc.file_url}
                    alt="Dokument"
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "12px"
                    }}
                  />

                  {/* INFO */}
                  <div>
                    <p style={{ margin: 0, fontWeight: "600" }}>
                      🏠 {house?.name || "Unbekannt"}
                    </p>

                    {apartment && (
                      <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                        🏢 {apartment.name}
                      </p>
                    )}

                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      Typ: {doc.type}
                    </p>

                    <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "10px",
                        background: "#0A2540",
                        color: "white",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontSize: "14px"
                      }}
                    >
                      Öffnen
                    </a>

                    <button
                      onClick={() => deleteDocument(doc)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px"
                      }}
                    >
                      Löschen
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}