import { useRef, useState, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { supabase } from "../supabase/supabaseClient";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
import { Camera, FileText } from "lucide-react";

export default function Documents() {
  const { houses } = useImmo();
  const { error: notifyError, success: notifySuccess, warning: notifyWarning } =
    useNotifications();

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("sonstiges"); // NEU: Manuelle Kategorie-Auswahl

  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const [editDoc, setEditDoc] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const selectedHouse = houses.find((h) => h.id === selectedHouseId);

  // =========================
  // CAMERA (FIXED + SAFE)
  // =========================
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error(err);
      notifyError("Kamera konnte nicht gestartet werden.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  // =========================
  // PHOTO
  // =========================
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setPhoto(dataUrl);
    stopCamera();
    runOCR(dataUrl);
  };

  // =========================
  // OCR
  // =========================
  const runOCR = async (image) => {
    setOcrLoading(true);

    try {
      const worker = await createWorker("deu+eng");
      const result = await worker.recognize(image);
      await worker.terminate();
      setOcrText(result.data.text || "");
    } catch (e) {
      console.error(e);
    }

    setOcrLoading(false);
  };

  // =========================
  // AUTO-DETECT + PREFILL (wie im Manager)
  // =========================
  useEffect(() => {
    if (ocrText) {
      const detected = autoDetectType(ocrText);
      setSelectedDocType(detected);
    }
  }, [ocrText]);

  // =========================
  // UPLOAD (jetzt mit manueller Kategorie-Auswahl)
  // =========================
  const uploadPhoto = async () => {
    if (!photo || !selectedHouseId) {
      notifyWarning("Haus und Foto sind erforderlich.");
      return;
    }

    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.id) {
        notifyWarning("Bitte einloggen, um Dokumente zu speichern.");
        setUploading(false);
        return;
      }

      const fileName = `${Date.now()}.jpg`;
      const filePath = `${selectedHouseId}/${fileName}`;

      const blob = await (await fetch(photo)).blob();

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const fileUrl = data.publicUrl;

      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        house_id: selectedHouseId,
        apartment_id: selectedApartmentId || null,
        file_url: fileUrl,
        storage_path: filePath,
        type: selectedDocType,           // ← Jetzt die manuell gewählte Kategorie
        title: extractTitle(ocrText),
        ocr_text: ocrText,
        mime_type: "image/jpeg",
      });

      if (dbError) throw dbError;

      notifySuccess("Dokument gespeichert und im Manager sichtbar");

      // Reset alles
      setPhoto(null);
      setSelectedHouseId("");
      setSelectedApartmentId("");
      setSelectedDocType("sonstiges");
      setOcrText("");
    } catch (e) {
      console.error(e);
      notifyError("Upload fehlgeschlagen");
    }

    setUploading(false);
  };

  // =========================
  // TYPE DETECTION (exakt dieselben Werte wie im DocumentsManager)
  // =========================
  const autoDetectType = (text) => {
    const t = text.toLowerCase();

    if (t.includes("rechnung")) return "rechnung";
    if (t.includes("miete")) return "vertrag";
    if (t.includes("versicherung")) return "versicherung";
    if (t.includes("reparatur")) return "reparatur";
    if (t.includes("mahnung")) return "mahnung";
    if (t.includes("nebenkosten")) return "nebenkostenabrechnung";
    if (t.includes("steuer")) return "steuerrelevant";

    return "sonstiges";
  };

  const extractTitle = (text) =>
    text?.split("\n")[0]?.slice(0, 60) || "Dokument";

  // =========================
  // EDIT SAVE (unverändert)
  // =========================
  const saveEdit = async () => {
    const { error } = await supabase
      .from("documents")
      .update({
        title: editDoc.title,
        type: editDoc.type,
        house_id: editDoc.house_id,
        apartment_id: editDoc.apartment_id || null,
      })
      .eq("id", editDoc.id);

    if (error) {
      notifyError("Fehler beim Speichern");
      return;
    }

    setEditOpen(false);
    setEditDoc(null);

    notifySuccess("Änderungen gespeichert");
  };

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <div style={headerIcon}>
            <FileText size={28} />
          </div>

          <div style={{ textAlign: "center", width: "100%" }}>
            <h1 style={title}>Dokumente Fotografieren</h1>
            <p style={subtitle}>
              Dokumente scannen, automatisch erkennen & speichern
            </p>
          </div>
        </div>

        {/* CAMERA CARD */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={smallIcon}>
              <Camera size={20} />
            </div>
            <h3 style={{ margin: 0 }}>Kamera</h3>
          </div>

          <p style={hint}>
            Fotografiere Dokumente und lasse sie automatisch auslesen.
          </p>

          {!stream && !photo && (
            <button onClick={startCamera} style={btn}>
              Kamera starten
            </button>
          )}

          {stream && (
            <>
              <video ref={videoRef} autoPlay playsInline style={video} />
              <button onClick={takePhoto} style={btn}>
                Foto aufnehmen
              </button>
            </>
          )}

          {photo && (
            <>
              <img src={photo} style={img} />

              {ocrLoading ? (
                <p>OCR läuft...</p>
              ) : (
                <pre style={ocrBox}>{ocrText}</pre>
              )}
            </>
          )}
        </div>

        {/* TARGET + KATEGORIE SELECTION (nur bei Foto) */}
        {photo && (
          <div style={card}>
            {/* Haus */}
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              style={input}
            >
              <option value="">Haus wählen</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            {/* Wohnung */}
            {selectedHouse && (
              <select
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
                style={input}
              >
                <option value="">Wohnung (optional)</option>
                {selectedHouse.apartments?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}

            {/* NEU: Kategorie-Auswahl – exakt dieselben wie im DocumentsManager */}
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              style={input}
            >
              <option value="rechnung">Rechnung</option>
              <option value="vertrag">Vertrag</option>
              <option value="versicherung">Versicherung</option>
              <option value="reparatur">Reparatur</option>
              <option value="nebenkostenabrechnung">Nebenkostenabrechnung</option>
              <option value="mahnung">Mahnung</option>
              <option value="steuerrelevant">SteuerRelevant</option>
              <option value="sonstiges">Sonstiges</option>
            </select>

            <button
              onClick={uploadPhoto}
              disabled={uploading}
              style={btn}
            >
              {uploading ? "Speichert..." : "Jetzt speichern"}
            </button>
          </div>
        )}

        {/* EDIT MODAL (unverändert) */}
        {editOpen && editDoc && (
          <div style={overlay}>
            <div style={modal}>
              <h2>Dokument bearbeiten</h2>

              <input
                value={editDoc.title}
                onChange={(e) =>
                  setEditDoc({ ...editDoc, title: e.target.value })
                }
                style={input}
              />

              <select
                value={editDoc.type}
                onChange={(e) =>
                  setEditDoc({ ...editDoc, type: e.target.value })
                }
                style={input}
              >
                <option value="rechnung">Rechnung</option>
                <option value="vertrag">Vertrag</option>
                <option value="versicherung">Versicherung</option>
                <option value="reparatur">Reparatur</option>
                <option value="nebenkostenabrechnung">Nebenkostenabrechnung</option>
                <option value="mahnung">Mahnung</option>
                <option value="steuerrelevant">SteuerRelevant</option>
                <option value="sonstiges">Sonstiges</option>
              </select>

              <button onClick={saveEdit} style={btn}>
                Speichern
              </button>

              <button onClick={() => setEditOpen(false)} style={btn}>
                Abbrechen
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

/* =========================
   STYLES – Gradient Design iOS/Android
========================= */

const page = {
  minHeight: "100vh",
  padding: "20px 16px 100px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a"
};

const container = {
  maxWidth: 1200,
  margin: "0 auto"
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 32,
  gap: 16
};

const headerIcon = {
  width: 60,
  height: 60,
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  flexShrink: 0
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  textAlign: "center",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
  textAlign: "center",
  fontWeight: 500
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  marginBottom: 20,
  width: "100%",
  maxWidth: "520px",
  marginLeft: "auto",
  marginRight: "auto"
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10
};

const smallIcon = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white"
};

const hint = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 16,
  fontWeight: 500
};

const btn = {
  padding: 18,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 16,
  width: "100%",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
  transition: "all 0.3s ease"
};

const video = {
  width: "100%",
  borderRadius: 14,
  marginTop: 10,
  background: "#000"
};

const img = {
  width: "100%",
  borderRadius: 14,
  marginTop: 10
};

const ocrBox = {
  whiteSpace: "pre-wrap",
  fontSize: 12,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 12,
  borderRadius: 14,
  marginTop: 10,
  maxHeight: 200,
  overflowY: "auto",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const input = {
  width: "100%",
  padding: 16,
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  marginBottom: 12,
  fontSize: 16,
  fontWeight: 500,
  color: "#1e293b",
  background: "white",
  transition: "all 0.2s ease"
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 20,
  width: "90%",
  maxWidth: 400,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};