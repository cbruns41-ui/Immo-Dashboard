import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useImmo } from "../context/ImmoContext";
import UploadDocumentModal from "../components/UploadDocumentModal";
import {
  UploadCloud,
  Menu,
  Star,
  FileText,
  Shield,
  FilePlus2,
  AlertTriangle,
  Banknote,
  Settings,
  Home
} from "lucide-react";

export default function DocumentsManager() {
  const { houses } = useImmo();

  const [documents, setDocuments] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarView, setSidebarView] = useState("all");
  const [loading, setLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // =========================
  // LOAD
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
  // DELETE
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
  // FAVORITE
  // =========================
  const toggleFavorite = async (doc) => {
    const { error } = await supabase
      .from("documents")
      .update({ is_favorite: !doc.is_favorite })
      .eq("id", doc.id);

    if (error) {
      console.error(error);
      return;
    }

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id ? { ...d, is_favorite: !d.is_favorite } : d
      )
    );
  };

  // =========================
  // HELPERS
  // =========================
  const getHouse = (id) => houses.find((h) => h.id === id);

  const getFileType = (doc) => {
    const mime = doc.mime_type || "";
    const url = doc.file_url || "";

    if (mime.startsWith("image/") || url.match(/\.(jpg|jpeg|png|webp)$/i)) return "image";
    if (mime.includes("pdf") || url.match(/\.pdf$/i)) return "pdf";
    if (mime.includes("word") || url.match(/\.(doc|docx)$/i)) return "word";
    if (mime.includes("sheet") || url.match(/\.(xls|xlsx)$/i)) return "excel";
    return "other";
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 900;

  // =========================
  // FILTERS
  // =========================
  const filteredDocs = documents.filter((doc) => {
    const house = getHouse(doc.house_id);

    const houseMatch = selectedHouse ? doc.house_id === selectedHouse : true;
    const aptMatch = selectedApartment ? doc.apartment_id === selectedApartment : true;
    const typeMatch = selectedType ? doc.type === selectedType : true;

    const searchMatch = search
      ? (
          doc.file_name?.toLowerCase().includes(search.toLowerCase()) ||
          doc.title?.toLowerCase().includes(search.toLowerCase()) ||
          doc.type?.toLowerCase().includes(search.toLowerCase()) ||
          doc.ocr_text?.toLowerCase().includes(search.toLowerCase()) ||
          house?.name?.toLowerCase().includes(search.toLowerCase())
        )
      : true;

    const sidebarMatch =
      sidebarView === "all"
        ? true
        : sidebarView === "favorites"
        ? doc.is_favorite
        : doc.type === sidebarView;

    return houseMatch && aptMatch && typeMatch && searchMatch && sidebarMatch;
  });

  // =========================
  // TYPES
  // =========================
  const types = [
    "rechnung",
    "vertrag",
    "versicherung",
    "reparatur",
    "nebenkostenabrechnung",
    "mahnung",
    "steuerrelevant",
    "sonstiges"
  ];

  return (
    <>
      {/* MOBILE HEADER BAR – jetzt fixed und app-optimiert */}
      {isMobile && (
        <div style={mobileTopBar}>
          <button onClick={() => setMobileSidebarOpen(true)} style={menuBtn}>
            <Menu />
          </button>

          <h2 style={{ margin: 0, fontSize: 18 }}>Dokumente</h2>

          <button onClick={() => setUploadOpen(true)} style={uploadFabSmall}>
            <UploadCloud size={18} />
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "260px 1fr",
          gap: "24px",
          padding: isMobile ? "80px 16px 28px 16px" : "28px",   // extra Top-Padding für feste App-Navigationsleiste (Home/Logout)
          maxWidth: "1450px",
          margin: "0 auto",
        }}
      >

        {/* =========================
            SIDEBAR (DESKTOP)
        ========================= */}
        {!isMobile && (
          <div style={sidebar}>
            <h3 style={{ marginTop: 0, color: "#0A2540" }}>Dokumente</h3>

            <SidebarButton active={sidebarView === "all"} onClick={() => setSidebarView("all")}>
              <FileText size={16} /> Alle
            </SidebarButton>

            <SidebarButton active={sidebarView === "favorites"} onClick={() => setSidebarView("favorites")}>
              <Star size={16} /> Favoriten
            </SidebarButton>

            <div style={divider} />

            {types.map((t) => (
              <SidebarButton
                key={t}
                active={sidebarView === t}
                onClick={() => setSidebarView(t)}
              >
                <FilePlus2 size={16} /> {t}
              </SidebarButton>
            ))}

            <div style={divider} />

            {houses.map((h) => (
              <div
                key={h.id}
                onClick={() => setSelectedHouse(h.id)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: selectedHouse === h.id ? "#eef6ff" : "transparent",
                  display: "flex",
                  gap: 8,
                  alignItems: "center"
                }}
              >
                <Home size={16} />
                {h.name}
              </div>
            ))}
          </div>
        )}

        {/* =========================
            MAIN
        ========================= */}
        <div>

          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <UploadCloud size={34} />
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0A2540" }}>
              Dokumente
            </h1>
            <p style={{ color: "#64748b" }}>
              Alle Dokumente verwalten, filtern und durchsuchen
            </p>
          </div>

          <input
            placeholder="Suche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />

          {loading ? (
            <p>Lade...</p>
          ) : filteredDocs.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: 18, color: "#64748b", marginTop: 60 }}>
              Keine Dokumente
            </p>
          ) : (
            <div style={grid}>
              {filteredDocs.map((doc) => {
                const house = getHouse(doc.house_id);
                const fileType = getFileType(doc);

                return (
                  <div key={doc.id} style={card}>
                    {fileType === "image" ? (
                      <img src={doc.file_url} style={img} />
                    ) : (
                      <div style={placeholder}>
                        <FileText size={40} />
                      </div>
                    )}

                    <b>{doc.file_name}</b>
                    <p style={{ fontSize: 12, color: "#666" }}>{house?.name}</p>

                    <div style={btnRow}>
                      <a href={doc.file_url} target="_blank" style={btn}>Öffnen</a>
                      <button onClick={() => deleteDocument(doc)} style={btnDanger}>Löschen</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FLOAT BUTTON */}
      <button onClick={() => setUploadOpen(true)} style={fab}>
        <UploadCloud />
      </button>

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={loadDocuments}
      />

      {/* =========================
          MOBILE SIDEBAR DRAWER – jetzt mit hohem zIndex, damit er über der App-Navigationsleiste (Home/Logout) liegt
      ========================= */}
      {isMobile && mobileSidebarOpen && (
        <div style={overlay} onClick={() => setMobileSidebarOpen(false)}>
          <div style={mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <h3>Filter</h3>

            <SidebarButton active={sidebarView === "all"} onClick={() => setSidebarView("all")}>
              <FileText size={16} /> Alle
            </SidebarButton>

            <SidebarButton active={sidebarView === "favorites"} onClick={() => setSidebarView("favorites")}>
              <Star size={16} /> Favoriten
            </SidebarButton>

            <div style={divider} />

            {types.map((t) => (
              <SidebarButton key={t} active={sidebarView === t} onClick={() => setSidebarView(t)}>
                <Settings size={16} /> {t}
              </SidebarButton>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// =========================
// UI COMPONENTS
// =========================
function SidebarButton({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%",
      textAlign: "left",
      padding: 10,
      borderRadius: 12,
      border: "none",
      marginBottom: 6,
      background: active ? "#0A2540" : "transparent",
      color: active ? "white" : "#0A2540",
      display: "flex",
      gap: 8,
      alignItems: "center",
      cursor: "pointer"
    }}>
      {children}
    </button>
  );
}

// =========================
// STYLES – optimiert für App-Darstellung (iOS PWA + Mobile)
// =========================

const sidebar = {
  background: "white",
  borderRadius: 22,
  padding: 22,
  border: "1px solid #edf0f2",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
};

const divider = {
  height: 1,
  background: "#eee",
  margin: "14px 0",
};

const searchInput = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
  marginBottom: 16,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
  gap: 16,
};

const card = {
  background: "white",
  borderRadius: 16,
  padding: 12,
};

const img = {
  width: "100%",
  height: 160,
  objectFit: "cover",
  borderRadius: 12,
  display: "block"
};

const placeholder = {
  height: 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const btnRow = {
  display: "flex",
  gap: 8,
  marginTop: 10,
};

const btn = {
  flex: 1,
  padding: 8,
  textAlign: "center",
  borderRadius: 10,
  background: "#0A2540",
  color: "white",
  textDecoration: "none",
};

const btnDanger = {
  flex: 1,
  padding: 8,
  borderRadius: 10,
  background: "#ef4444",
  color: "white",
  border: "none",
};

const fab = {
  position: "fixed",
  bottom: 24,
  right: 24,
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#0A2540",
  color: "white",
  border: "none",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  zIndex: 9999,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  zIndex: 10000,                    // höher als App-Navigationsleiste
};

const mobileSidebar = {
  width: 280,
  background: "white",
  height: "100%",
  padding: 16,
  boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
  zIndex: 10001,                    // garantiert über Home/Logout-Button
};

const mobileTopBar = {
  position: "fixed",                // jetzt fest oben – verhindert Überlappung
  top: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 12,
  background: "white",
  borderBottom: "1px solid #eee",
  zIndex: 9999,
};

const menuBtn = {
  background: "none",
  border: "none",
};

const uploadFabSmall = {
  background: "#0A2540",
  color: "white",
  border: "none",
  borderRadius: 10,
  width: 36,
  height: 36,
};