import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useImmo } from "../context/ImmoContext";
import UploadDocumentModal from "../components/UploadDocumentModal";
import {
  UploadCloud,
  Menu,
  Star,
  FileText,
  FilePlus2,
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

    if (error) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? { ...d, is_favorite: !d.is_favorite }
          : d
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

    if (
      mime.startsWith("image/") ||
      url.match(/\.(jpg|jpeg|png|webp)$/i)
    )
      return "image";

    if (mime.includes("pdf") || url.match(/\.pdf$/i))
      return "pdf";

    if (mime.includes("word") || url.match(/\.(doc|docx)$/i))
      return "word";

    if (mime.includes("sheet") || url.match(/\.(xls|xlsx)$/i))
      return "excel";

    return "other";
  };

  const isMobile =
    typeof window !== "undefined" &&
    window.innerWidth < 900;

  // =========================
  // FILTERS
  // =========================
  const filteredDocs = documents.filter((doc) => {
    const house = getHouse(doc.house_id);

    const houseMatch = selectedHouse
      ? doc.house_id === selectedHouse
      : true;

    const aptMatch = selectedApartment
      ? doc.apartment_id === selectedApartment
      : true;

    const typeMatch = selectedType
      ? doc.type === selectedType
      : true;

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

    return (
      houseMatch &&
      aptMatch &&
      typeMatch &&
      searchMatch &&
      sidebarMatch
    );
  });

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
      {/* =========================
          MOBILE TOP BAR
      ========================= */}
      {isMobile && (
        <div style={mobileTopBar}>
          <button onClick={() => setMobileSidebarOpen(true)} style={menuBtn}>
            <Menu />
          </button>

          <h2 style={mobileTitle}>Dokumente</h2>

          <button onClick={() => setUploadOpen(true)} style={uploadFabSmall}>
            <UploadCloud size={18} />
          </button>
        </div>
      )}

      {/* =========================
          LAYOUT
      ========================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
          gap: "16px",
          padding: isMobile ? "140px 12px 20px" : "18px",
          maxWidth: "1450px",
          margin: "0 auto"
        }}
      >
        {/* =========================
            SIDEBAR DESKTOP
        ========================= */}
        {!isMobile && (
          <div style={sidebar}>
            <h3 style={{ marginTop: 0 }}>Dokumente</h3>

            <SidebarButton active={sidebarView === "all"} onClick={() => setSidebarView("all")}>
              Alle
            </SidebarButton>

            <SidebarButton active={sidebarView === "favorites"} onClick={() => setSidebarView("favorites")}>
              Favoriten
            </SidebarButton>

            <div style={divider} />

            {types.map((t) => (
              <SidebarButton
                key={t}
                active={sidebarView === t}
                onClick={() => setSidebarView(t)}
              >
                {t}
              </SidebarButton>
            ))}

            <div style={divider} />

            {houses.map((h) => (
              <div
                key={h.id}
                onClick={() => setSelectedHouse(h.id)}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                  background:
                    selectedHouse === h.id ? "#eef6ff" : "transparent",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  fontSize: 13
                }}
              >
                <Home size={14} />
                {h.name}
              </div>
            ))}
          </div>
        )}

        {/* =========================
            MAIN CONTENT
        ========================= */}
        <div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <UploadCloud size={28} />
            <h1 style={{ margin: 0, fontSize: 26 }}>Dokumente</h1>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Verwaltung & Suche
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
            <p style={{ textAlign: "center", marginTop: 40 }}>
              Keine Dokumente gefunden
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
                        <FileText size={28} />
                      </div>
                    )}

                    <b style={{ fontSize: 12 }}>{doc.file_name}</b>

                    <p style={{ fontSize: 11, color: "#666" }}>
                      {house?.name}
                    </p>

                    <div style={btnRow}>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        style={btn}
                      >
                        Öffnen
                      </a>

                      <button
                        onClick={() => deleteDocument(doc)}
                        style={btnDanger}
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

      {/* FLOAT BUTTON */}
      <button onClick={() => setUploadOpen(true)} style={fab}>
        <UploadCloud size={22} />
      </button>

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={loadDocuments}
      />

      {/* MOBILE SIDEBAR */}
      {isMobile && mobileSidebarOpen && (
        <div
          style={overlay}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={mobileSidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Filter</h3>

            <SidebarButton
              active={sidebarView === "all"}
              onClick={() => setSidebarView("all")}
            >
              Alle
            </SidebarButton>

            <SidebarButton
              active={sidebarView === "favorites"}
              onClick={() => setSidebarView("favorites")}
            >
              Favoriten
            </SidebarButton>

            {types.map((t) => (
              <SidebarButton
                key={t}
                active={sidebarView === t}
                onClick={() => setSidebarView(t)}
              >
                {t}
              </SidebarButton>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// =========================
// SIDEBAR BUTTON
// =========================
function SidebarButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 8,
        borderRadius: 10,
        border: "none",
        marginBottom: 6,
        background: active ? "#0A2540" : "transparent",
        color: active ? "white" : "#040c14",
        display: "flex",
        gap: 8,
        alignItems: "center",
        cursor: "pointer",
        fontSize: 13
      }}
    >
      {children}
    </button>
  );
}

// =========================
// STYLES (kompakter)
// =========================

const sidebar = {
  background: "white",
  borderRadius: 16,
  padding: 14,
  border: "1px solid #edf0f2"
};

const divider = {
  height: 1,
  background: "#eee",
  margin: "10px 0"
};

const searchInput = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginBottom: 12
};

/* 🔥 MEHR ITEMS PRO ZEILE */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 10
};

const card = {
  background: "white",
  borderRadius: 14,
  padding: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 3px 10px rgba(0,0,0,0.04)"
};

const img = {
  width: "100%",
  height: 95,
  objectFit: "cover",
  borderRadius: 10
};

const placeholder = {
  height: 95,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const btnRow = {
  display: "flex",
  gap: 6,
  marginTop: 8
};

const btn = {
  flex: 1,
  padding: 6,
  fontSize: 11,
  textAlign: "center",
  borderRadius: 8,
  background: "#0A2540",
  color: "white",
  textDecoration: "none"
};

const btnDanger = {
  flex: 1,
  padding: 6,
  fontSize: 11,
  borderRadius: 8,
  background: "#ef4444",
  color: "white",
  border: "none"
};

const fab = {
  position: "fixed",
  bottom: 18,
  right: 18,
  width: 54,
  height: 54,
  borderRadius: "50%",
  background: "#040f1a",
  color: "white",
  border: "none",
  zIndex: 9999
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  zIndex: 10000
};

const mobileSidebar = {
  width: 260,
  background: "white",
  height: "100%",
  padding: 14
};

const mobileTopBar = {
  position: "fixed",
  top: 70,
  left: 0,
  right: 0,
  height: 54,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 12px",
  background: "white",
  borderBottom: "1px solid #eee",
  zIndex: 9000
};

const mobileTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700
};

const menuBtn = {
  background: "none",
  border: "none"
};

const uploadFabSmall = {
  background: "#040e18",
  color: "white",
  border: "none",
  borderRadius: 8,
  width: 34,
  height: 34
};