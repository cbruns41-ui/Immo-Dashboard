import { useRef, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
import { UploadCloud, X, FolderUp } from "lucide-react";

export default function UploadDocumentModal({
  open,
  onClose,
  onUploaded,
}) {
  const { houses } = useImmo();
  const { error: notifyError, success: notifySuccess, warning: notifyWarning } =
    useNotifications();

  const fileInputRef = useRef();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [selectedHouse, setSelectedHouse] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [type, setType] = useState("sonstiges");

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    setFiles(arr);
  };

  const uploadFiles = async () => {
    if (!files.length) {
      notifyWarning("Bitte Dateien auswählen");
      return;
    }
    if (!selectedHouse) {
      notifyWarning("Bitte Haus auswählen");
      return;
    }

    setUploading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const folder = selectedApartment
          ? `${selectedHouse}/${selectedApartment}`
          : `${selectedHouse}/ohne-wohnung`;

        const storagePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, file);

        if (uploadError) {
          console.error("UPLOAD ERROR:", uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from("documents")
          .getPublicUrl(storagePath);

        const fileUrl = `${data.publicUrl}?t=${Date.now()}`;

        await supabase
          .from("documents")
          .insert({
            user_id: user?.id,
            house_id: selectedHouse,
            apartment_id: selectedApartment || null,
            file_url: fileUrl,
            storage_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            type,
            title: file.name,
            is_favorite: false,
            storage_folder: folder,
          });
      }

      notifySuccess("Upload abgeschlossen");
      setFiles([]);
      onUploaded?.();
      onClose();

      setSelectedHouse("");
      setSelectedApartment("");
      setType("sonstiges");
    } catch (err) {
      console.error(err);
      notifyError("Upload fehlgeschlagen");
    }

    setUploading(false);
  };

  const apartments =
    houses.find((h) => h.id === selectedHouse)?.apartments || [];

  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        {/* HEADER */}
        <div style={pageHeader}>
          <div style={pageIcon}>
            <UploadCloud size={28} />
          </div>
          <h1 style={pageTitle}>Dokumente hochladen</h1>
          <p style={pageSubtitle}>
            Dateien hochladen und automatisch dem richtigen Objekt zuordnen
          </p>

          <button onClick={onClose} style={closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* DROPZONE */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          style={dropzoneStyle}
        >
          <FolderUp size={42} />
          <p style={{ fontWeight: 600, marginTop: 12 }}>
            Dokumente hochladen
          </p>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: 4 }}>
            Tippen oder Dateien hineinziehen
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* FILE LIST */}
        {files.length > 0 && (
          <div style={fileListStyle}>
            {files.map((file, i) => (
              <div key={i} style={fileItemStyle}>
                <strong>{file.name}</strong>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORM */}
        <div style={formStyle}>
          <select
            value={selectedHouse}
            onChange={(e) => {
              setSelectedHouse(e.target.value);
              setSelectedApartment("");
            }}
            style={inputStyle}
          >
            <option value="">Haus auswählen</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedApartment}
            onChange={(e) => setSelectedApartment(e.target.value)}
            style={inputStyle}
          >
            <option value="">Wohnung (optional)</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={inputStyle}
          >
            <option value="rechnung">Rechnung</option>
            <option value="vertrag">Vertrag</option>
            <option value="versicherung">Versicherung</option>
            <option value="reparatur">Reparatur</option>
            <option value="nebenkostenabrechnung">Nebenkostenabrechnung</option>
            <option value="mahnung">Mahnung</option>
            <option value="steuerrelevant">Steuerrelevant</option>
            <option value="sonstiges">Sonstiges</option>
          </select>
        </div>

        {/* BUTTONS */}
        <div style={buttonRowStyle}>
          <button onClick={onClose} style={cancelBtn}>
            Abbrechen
          </button>

          <button
            onClick={uploadFiles}
            disabled={uploading}
            style={uploadBtn}
          >
            {uploading ? "Upload läuft..." : "Jetzt hochladen"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* =========================
   MOBILE-OPTIMIERTE SAAS STYLES
========================= */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "20px 16px",
};

const modalStyle = {
  width: "100%",
  maxWidth: 520,
  background: "white",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  fontFamily: "Inter, Arial",
  color: "#0f172a",
};

const pageHeader = {
  textAlign: "center",
  marginBottom: 28,
  position: "relative",
};

const pageIcon = {
  width: 64,
  height: 64,
  borderRadius: 16,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 12px",
};

const pageTitle = {
  fontSize: 28,
  fontWeight: 800,
  margin: 0,
};

const pageSubtitle = {
  fontSize: 15,
  color: "#64748b",
  marginTop: 6,
};

const closeBtn = {
  position: "absolute",
  right: 0,
  top: 0,
  background: "#f1f5f9",
  border: "none",
  width: 40,
  height: 40,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const dropzoneStyle = {
  border: "2px dashed #e2e8f0",
  borderRadius: 18,
  padding: 40,
  textAlign: "center",
  cursor: "pointer",
  background: "#f8fafc",
  marginBottom: 24,
};

const fileListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginBottom: 24,
};

const fileItemStyle = {
  padding: 14,
  background: "#f8fafc",
  borderRadius: 12,
  fontSize: 14,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginBottom: 28,
};

const inputStyle = {
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  background: "#f8fafc",
};

const buttonRowStyle = {
  display: "flex",
  gap: 12,
};

const cancelBtn = {
  flex: 1,
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const uploadBtn = {
  flex: 2,
  padding: 16,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};