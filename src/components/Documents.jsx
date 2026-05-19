import { useState, useRef } from "react";
import { useImmo } from "../context/ImmoContext";
import { supabase } from "../supabase/supabaseClient";
import Tesseract from "tesseract.js";

export default function Documents() {
  const { houses } = useImmo();

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState("");

  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const selectedHouse = houses.find(h => h.id === selectedHouseId);

  // =========================
  // CAMERA START (iOS FIX)
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
          videoRef.current.play().catch(console.error);
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
  // PHOTO CAPTURE
  // =========================
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setPhoto(dataUrl);
    stopCamera();

    runOCR(dataUrl);
  };

  // =========================
  // OCR (TESSERACT)
  // =========================
  const runOCR = async (image) => {
    try {
      setOcrLoading(true);

      const result = await Tesseract.recognize(image, "deu+eng");

      setOcrText(result.data.text || "");

    } catch (err) {
      console.error("OCR Fehler:", err);
    } finally {
      setOcrLoading(false);
    }
  };

  // =========================
  // UPLOAD TO SUPABASE
  // =========================
  const uploadPhoto = async () => {
    if (!photo || !selectedHouseId) {
      alert("Bitte Foto und Haus auswählen!");
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

      // 2. Public URL holen
      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // 3. DB Eintrag
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          house_id: selectedHouseId,
          apartment_id: selectedApartmentId || null,
          file_url: fileUrl,
          file_path: filePath,
          type: autoDetectType(ocrText),
          title: extractTitle(ocrText),
          ocr_text: ocrText
        });

      if (dbError) throw dbError;

      alert("✅ Dokument gespeichert!");

      setPhoto(null);
      setSelectedHouseId("");
      setSelectedApartmentId("");
      setOcrText("");

    } catch (err) {
      console.error(err);
      alert("Fehler beim Upload");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // AUTO CATEGORY
  // =========================
  const autoDetectType = (text) => {
    const t = text.toLowerCase();

    if (t.includes("rechnung")) return "rechnung";
    if (t.includes("miete")) return "vertrag";
    if (t.includes("versicherung")) return "versicherung";
    if (t.includes("reparatur")) return "reparatur";

    return "sonstiges";
  };

  // =========================
  // TITLE EXTRACTION
  // =========================
  const extractTitle = (text) => {
    if (!text) return "Dokument";
    return text.split("\n")[0].slice(0, 60);
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

      {/* CAMERA */}
      <div style={{
        background: "white",
        padding: "35px",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
      }}>

        {!stream && !photo && (
          <button onClick={startCamera} style={{
            width: "100%",
            padding: "18px",
            background: "#0A2540",
            color: "white",
            border: "none",
            borderRadius: "16px"
          }}>
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

            <button onClick={takePhoto} style={{
              marginTop: "20px",
              padding: "16px 40px",
              background: "#00D4C8",
              color: "white",
              border: "none",
              borderRadius: "12px"
            }}>
              Foto aufnehmen
            </button>
          </div>
        )}

        {photo && (
          <div style={{ textAlign: "center" }}>
            <img src={photo} style={{
              width: "100%",
              maxHeight: "420px",
              borderRadius: "16px"
            }} />

            {ocrLoading ? (
              <p>OCR läuft...</p>
            ) : (
              <pre style={{
                whiteSpace: "pre-wrap",
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "10px",
                marginTop: "10px"
              }}>
                {ocrText}
              </pre>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setPhoto(null)} style={{ flex: 1 }}>
                Neu
              </button>

              <button onClick={uploadPhoto} disabled={uploading} style={{
                flex: 1,
                background: "#0A2540",
                color: "white"
              }}>
                {uploading ? "Speichert..." : "Speichern"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TARGET SELECT */}
      {photo && (
        <div style={{
          marginTop: "20px",
          background: "white",
          padding: "25px",
          borderRadius: "20px"
        }}>
          <h3>Zuordnen</h3>

          <select value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
            style={{ width: "100%", padding: "14px" }}
          >
            <option value="">Haus wählen</option>
            {houses.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {selectedHouse && (
            <select value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value)}
              style={{ width: "100%", padding: "14px", marginTop: "10px" }}
            >
              <option value="">Wohnung optional</option>
              {selectedHouse.apartments?.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}