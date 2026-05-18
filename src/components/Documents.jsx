import { useRef, useState } from "react";
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const selectedHouse = houses.find(h => h.id === selectedHouseId);

  const selectedApartment = selectedHouse?.apartments?.find(
    a => a.id === selectedApartmentId
  );

  // =========================
  // AUTO KATEGORIE
  // =========================
  const detectType = (text = "") => {
    const t = text.toLowerCase();

    if (t.includes("miete") || t.includes("rechnung")) return "rechnung";
    if (t.includes("strom") || t.includes("gas") || t.includes("wasser")) return "nebenkosten";
    if (t.includes("versicherung")) return "versicherung";
    if (t.includes("vertrag")) return "vertrag";
    if (t.includes("reparatur") || t.includes("handwerker")) return "reparatur";

    return "sonstiges";
  };

  // =========================
  // OCR FUNCTION
  // =========================
  const runOCR = async (imageDataUrl) => {
    const worker = await createWorker("deu+eng");

    const {
      data: { text },
    } = await worker.recognize(imageDataUrl);

    await worker.terminate();

    return text;
  };

  // =========================
  // CAMERA
  // =========================
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert("Kamera konnte nicht gestartet werden");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setPhoto(dataUrl);
    stopCamera();
  };

  // =========================
  // UPLOAD PRO (MIT OCR)
  // =========================
  const uploadPhoto = async () => {
    if (!photo || !selectedHouseId) {
      alert("Bitte Haus auswählen und Foto aufnehmen!");
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

      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 2. OCR TEXT
      const ocrText = await runOCR(photo);

      // 3. AUTO TYPE
      const type = detectType(ocrText);

      // 4. SAVE DB
      const { error } = await supabase.from("documents").insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        house_id: selectedHouseId,
        apartment_id: selectedApartmentId || null,
        file_url: publicUrl,
        type,
        name: `Dokument ${new Date().toLocaleDateString()}`,
        ocr_text: ocrText
      });

      if (error) throw error;

      alert("✅ Dokument gespeichert + OCR fertig!");

      setPhoto(null);
      setSelectedHouseId("");
      setSelectedApartmentId("");

    } catch (err) {
      console.error(err);
      alert("Fehler beim Upload");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // UI (dein Stil beibehalten)
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
            Smart Dokumente
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "18px" }}>
            Upload + OCR + Auto-Kategorisierung
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
            Kamera öffnen
          </button>
        )}

        {stream && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%", borderRadius: "16px" }}
            />

            <button onClick={takePhoto} style={{
              marginTop: "20px",
              width: "100%",
              padding: "16px",
              background: "#00D4C8",
              border: "none",
              borderRadius: "12px"
            }}>
              Foto aufnehmen
            </button>
          </>
        )}

        {photo && (
          <>
            <img src={photo} style={{ width: "100%", borderRadius: "16px" }} />

            {/* SELECT */}
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              style={{ width: "100%", marginTop: 20 }}
            >
              <option value="">Haus wählen</option>
              {houses.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <button
              onClick={uploadPhoto}
              disabled={uploading}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "16px",
                background: "#0A2540",
                color: "white",
                borderRadius: "12px",
                border: "none"
              }}
            >
              {uploading ? "Verarbeite OCR..." : "Speichern + OCR"}
            </button>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}