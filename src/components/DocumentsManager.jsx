import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
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
  const { error: notifyError, success: notifySuccess } = useNotifications();

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

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
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

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    if (doc.storage_path) {
      await supabase.storage.from("documents").remove([doc.storage_path]);
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id)
      .eq("user_id", userId);

    if (error) {
      notifyError("Fehler beim Löschen");
      return;
    }

    notifySuccess("Dokument gelöscht");
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  // =========================
  // FAVORITE
  // =========================
  const toggleFavorite = async (doc) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from("documents")
      .update({ is_favorite: !doc.is_favorite })
      .eq("id", doc.id)
      .eq("user_id", userId);

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
            <h3 style={{ 
              marginTop: 0, 
              fontSize: 18, 
              fontWeight: 800, 
              background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 16 
            }}>Dokumente</h3>

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
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Filter</h3>

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
        padding: 10,
        borderRadius: 12,
        border: "none",
        marginBottom: 6,
        background: active ? "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" : "transparent",
        color: active ? "white" : "#0f172a",
        display: "flex",
        gap: 8,
        alignItems: "center",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        transition: "all 0.2s ease"
      }}
    >
      {children}
    </button>
  );
}

// =========================
// STYLES – Gradient Design iOS/Android
// =========================

const sidebar = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  padding: 16,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const divider = {
  height: 1,
  background: "rgba(226, 232, 240, 0.5)",
  margin: "12px 0"
};

const searchInput = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  marginBottom: 12,
  fontSize: 14,
  fontWeight: 500,
  color: "#1e293b",
  background: "white",
  transition: "all 0.2s ease"
};

/* 🔥 MEHR ITEMS PRO ZEILE */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 12
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 18,
  padding: 12,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease"
};

const img = {
  width: "100%",
  height: 100,
  objectFit: "cover",
  borderRadius: 12
};

const placeholder = {
  height: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  borderRadius: 12
};

const btnRow = {
  display: "flex",
  gap: 8,
  marginTop: 10
};

const btn = {
  flex: 1,
  padding: 8,
  fontSize: 12,
  textAlign: "center",
  borderRadius: 10,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};

const btnDanger = {
  flex: 1,
  padding: 8,
  fontSize: 12,
  borderRadius: 10,
  background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
  color: "white",
  border: "none",
  fontWeight: 700,
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  transition: "all 0.2s ease"
};

const fab = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  zIndex: 9999,
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
  transition: "all 0.3s ease"
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  zIndex: 10000
};

const mobileSidebar = {
  width: 280,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  height: "100%",
  padding: 16,
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const mobileTopBar = {
  position: "fixed",
  top: 70,
  left: 0,
  right: 0,
  height: 56,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 16px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
  zIndex: 9000
};

const mobileTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 800,
  color: "#0f172a"
};

const menuBtn = {
  background: "none",
  border: "none"
};

const uploadFabSmall = {
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  width: 36,
  height: 36,
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};