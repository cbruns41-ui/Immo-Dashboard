import { useState, useRef } from "react";
import { useImmo } from "../context/ImmoContext";
import { supabase } from "../supabase/supabaseClient";
import { createWorker } from "tesseract.js";

export default function Documents() {
  const { houses } = useImmo();

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState("");

  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const selectedHouse = houses.find(h => h.id === selectedHouseId);

  // =========================
  // KAMERA START
  // =========================
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          videoRef.current.play().catch((err) => {
            console.log("Video play error:", err);
          });
        }
      }, 100);

    } catch (err) {
      console.error(err);
      alert("Kamera konnte nicht gestartet werden.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // =========================
  // FOTO MACHEN
  // =========================
  const takePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);

    stopCamera();

    // 👉 OCR direkt nach Foto starten
    await runOCR(dataUrl);
  };

  // =========================
  // OCR (TEXT ERKENNUNG)
  // =========================
  const runOCR = async (image) => {
    setAnalyzing(true);

    try {
      const worker = await createWorker("deu+eng");

      const result = await worker.recognize(image);

      const text = result.data.text;
      setOcrText(text);

      await worker.terminate();
    } catch (err) {
      console.error("OCR Fehler:", err);
    }

    setAnalyzing(false);
  };

  // =========================
  // TYPE ERKENNUNG (simpel)
  // =========================
  const detectType = (text) => {
    const t = text.toLowerCase();

    if (t.includes("rechnung") || t.includes("invoice")) return "rechnung";
    if (t.includes("versicherung")) return "versicherung";
    if (t.includes("miete")) return "vertrag";
    if (t.includes("reparatur")) return "reparatur";

    return "sonstiges";
  };

  const detectTitle = (text) => {
    const lines = text.split("\n").filter(Boolean);
    return lines[0]?.slice(0, 60) || "Dokument";
  };

  // =========================
  // UPLOAD
  // =========================
  const uploadPhoto = async () => {
    if (!photo || !selectedHouseId) {
      alert("Bitte Foto machen und ein Haus auswählen!");
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}.jpg`;
      const filePath = `${selectedHouseId}/${fileName}`;

      const blob = await (await fetch(photo)).blob();

      // 1. Upload Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Public URL
      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // 3. Auto-Kategorie + Titel
      const type = detectType(ocrText);
      const title = detectTitle(ocrText);

      // 4. DB speichern
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          house_id: selectedHouseId,
          apartment_id: selectedApartmentId || null,
          file_url: publicUrl,
          title,
          type,
          ocr_text: ocrText,
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      alert("✅ Dokument gespeichert + OCR fertig!");

      setPhoto(null);
      setSelectedHouseId("");
      setSelectedApartmentId("");
      setOcrText("");

    } catch (err) {
      console.error(err);
      alert("Fehler beim Hochladen.");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // UI
  // =========================
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
          📸
        </div>

        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0A2540" }}>
            Dokumente scannen
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            OCR + automatische Kategorisierung
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div style={{
        background: "white",
        padding: "35px",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        marginBottom: "30px"
      }}>

        {!stream && !photo && (
          <button
            onClick={startCamera}
            style={{
              width: "100%",
              padding: "18px",
              background: "#0A2540",
              color: "white",
              border: "none",
              borderRadius: "16px",
              fontSize: "18px",
              fontWeight: "600"
            }}
          >
            📸 Kamera öffnen
          </button>
        )}

        {stream && (
          <div style={{ textAlign: "center" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                maxHeight: "420px",
                borderRadius: "16px",
                background: "#000"
              }}
            />

            <button
              onClick={takePhoto}
              style={{
                marginTop: "20px",
                padding: "16px 40px",
                background: "#00D4C8",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "17px"
              }}
            >
              Foto aufnehmen
            </button>
          </div>
        )}

        {photo && (
          <div style={{ textAlign: "center" }}>
            <img
              src={photo}
              alt="Dokument"
              style={{
                width: "100%",
                maxHeight: "420px",
                borderRadius: "16px",
                objectFit: "contain"
              }}
            />

            {analyzing && <p>🔍 OCR analysiert...</p>}

            {ocrText && (
              <div style={{
                marginTop: 15,
                padding: 15,
                background: "#f1f5f9",
                borderRadius: 10,
                fontSize: 12,
                textAlign: "left",
                maxHeight: 150,
                overflow: "auto"
              }}>
                {ocrText}
              </div>
            )}

            <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
              <button
                onClick={() => setPhoto(null)}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "12px"
                }}
              >
                Neu machen
              </button>

              <button
                onClick={uploadPhoto}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: "#0A2540",
                  color: "white",
                  border: "none",
                  borderRadius: "12px"
                }}
              >
                {uploading ? "Wird hochgeladen..." : "Speichern"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STORAGE TARGET */}
      {photo && (
        <div style={{
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
        }}>
          <h3>Speicherort auswählen</h3>

          <select
            value={selectedHouseId}
            onChange={e => setSelectedHouseId(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid #e0e0e0"
            }}
          >
            <option value="">Haus auswählen...</option>
            {houses.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {selectedHouse && (
            <select
              value={selectedApartmentId}
              onChange={e => setSelectedApartmentId(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e0e0e0"
              }}
            >
              <option value="">Wohnung (optional)</option>
              {selectedHouse.apartments?.map(apt => (
                <option key={apt.id} value={apt.id}>
                  {apt.name} – {apt.tenant}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}