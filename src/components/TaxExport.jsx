import { useMemo, useState, useEffect, useRef } from "react";
import { useImmo } from "../context/ImmoContext";
import { supabase } from "../supabase/supabaseClient";

import {
  Receipt,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  FileText,
  Euro,
  Filter,
  Mail,
  Plus,
  Trash2,
  Camera,
} from "lucide-react";

export default function TaxExport() {
  const { houses = [], transactions = [] } = useImmo();

  // =========================
  // STATES
  // =========================

  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedApartment, setSelectedApartment] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  // Manuelle Buchungen
  const [addedEntries, setAddedEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: today,
    type: "expense",
    amount: "",
    category: "",
    description: "",
    houseId: houses.length > 0 ? houses[0].id : "",
    apartmentId: "",
  });

  // =========================
  // CAMERA STATES (Beleg-Foto)
  // =========================
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [ocrTextBeleg, setOcrTextBeleg] = useState("");
  const [ocrLoadingBeleg, setOcrLoadingBeleg] = useState(false);
  const [uploadingBeleg, setUploadingBeleg] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // =========================
  // DYNAMISCHE WOHNUNGS-RESET
  // =========================
  useEffect(() => {
    if (selectedHouse === "all") {
      setSelectedApartment("all");
    } else {
      const houseApartments = houses.find((h) => h.id === selectedHouse)?.apartments || [];
      if (selectedApartment !== "all" && !houseApartments.some((a) => a.id === selectedApartment)) {
        setSelectedApartment("all");
      }
    }
  }, [selectedHouse, houses]);

  useEffect(() => {
    const houseApartments = houses.find((h) => h.id === newEntry.houseId)?.apartments || [];
    if (newEntry.apartmentId && !houseApartments.some((a) => a.id === newEntry.apartmentId)) {
      setNewEntry((prev) => ({ ...prev, apartmentId: "" }));
    }
  }, [newEntry.houseId, houses]);

  // Kamera aufräumen beim Verlassen
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  // =========================
  // CAMERA FUNKTIONEN (Beleg)
  // =========================
  const startCameraBeleg = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setCameraStream(mediaStream);
      setIsCameraActive(true);
      setCapturedPhoto(null);
      setOcrTextBeleg("");

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Kamera konnte nicht gestartet werden. Bitte Berechtigung prüfen.");
    }
  };

  const stopCameraBeleg = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const takePhotoBeleg = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedPhoto(dataUrl);
    stopCameraBeleg();
    runOCRBeleg(dataUrl);
  };

  const runOCRBeleg = async (image) => {
    setOcrLoadingBeleg(true);
    try {
      const result = await Tesseract.recognize(image, "deu+eng");
      setOcrTextBeleg(result.data.text || "");
    } catch (e) {
      console.error(e);
    }
    setOcrLoadingBeleg(false);
  };

  // =========================
  // BELEG HOCHLADEN + BUCHUNG SPEICHERN
  // =========================
  const saveWithBeleg = async () => {
    if (!capturedPhoto || !newEntry.houseId || !newEntry.amount || !newEntry.description.trim()) {
      alert("Bitte Haus, Betrag, Beschreibung und Foto ausfüllen.");
      return;
    }

    setUploadingBeleg(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      const fileName = `beleg-${Date.now()}.jpg`;
      const filePath = `${newEntry.houseId}/${fileName}`;

      const blob = await (await fetch(capturedPhoto)).blob();

      // 1. Foto in Storage hochladen
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);
      const fileUrl = urlData.publicUrl;

      // 2. Dokument in DB speichern (genau wie in Documents.js)
      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        house_id: newEntry.houseId,
        apartment_id: newEntry.apartmentId || null,
        file_url: fileUrl,
        storage_path: filePath,
        type: autoDetectType(ocrTextBeleg),
        title: extractTitle(ocrTextBeleg),
        ocr_text: ocrTextBeleg,
        mime_type: "image/jpeg",
      });

      if (dbError) throw dbError;

      // 3. Manuelle Buchung erstellen (wie bisher)
      const amountNum = Number(newEntry.amount);
      const entry = {
        id: `manual-${Date.now()}`,
        date: newEntry.date || today,
        type: newEntry.type,
        amount: amountNum,
        description: newEntry.description.trim(),
        houseId: newEntry.houseId,
        apartmentId: newEntry.apartmentId || "",
        category: newEntry.category.trim() || "Sonstiges",
      };

      setAddedEntries((prev) => [...prev, entry]);

      // Erfolgsmeldung + Reset
      alert("✅ Beleg gespeichert + Buchung zur Export-Vorschau hinzugefügt!");

      // Formular zurücksetzen
      setNewEntry({
        date: today,
        type: "expense",
        amount: "",
        category: "",
        description: "",
        houseId: houses.length > 0 ? houses[0].id : "",
        apartmentId: "",
      });

      setCapturedPhoto(null);
      setOcrTextBeleg("");
      setIsCameraActive(false);
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern des Belegs.");
    }

    setUploadingBeleg(false);
  };

  // =========================
  // TYPE DETECTION & TITLE (aus Documents.js)
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

  const extractTitle = (text) => text?.split("\n")[0]?.slice(0, 60) || "Beleg";

  // =========================
  // NORMALE BUCHUNG OHNE FOTO
  // =========================
  const handleNewEntryChange = (field) => (e) => {
    setNewEntry((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddEntry = () => {
    if (!newEntry.houseId || !newEntry.amount || !newEntry.description.trim()) {
      alert("Bitte Haus, Betrag und Beschreibung ausfüllen.");
      return;
    }

    const amountNum = Number(newEntry.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Bitte einen gültigen Betrag eingeben.");
      return;
    }

    const entry = {
      id: `manual-${Date.now()}`,
      date: newEntry.date || today,
      type: newEntry.type,
      amount: amountNum,
      description: newEntry.description.trim(),
      houseId: newEntry.houseId,
      apartmentId: newEntry.apartmentId || "",
      category: newEntry.category.trim() || "Sonstiges",
    };

    setAddedEntries((prev) => [...prev, entry]);

    setNewEntry({
      date: today,
      type: "expense",
      amount: "",
      category: "",
      description: "",
      houseId: houses.length > 0 ? houses[0].id : "",
      apartmentId: "",
    });

    alert("Buchung zur Export-Vorschau hinzugefügt!");
  };

  const handleDeleteManual = (id) => {
    setAddedEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  // =========================
  // ALLE TRANSAKTIONEN + FILTER
  // =========================
  const allTransactions = useMemo(() => [...transactions, ...addedEntries], [transactions, addedEntries]);

  const displayedTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      const matchesDate = transactionDate >= start && transactionDate <= end;
      const matchesYear = transactionDate.getFullYear() === Number(selectedYear);
      const matchesHouse = selectedHouse === "all" || t.houseId === selectedHouse;
      const matchesApartment = selectedApartment === "all" || (t.apartmentId && t.apartmentId === selectedApartment);
      const matchesType = selectedType === "all" || t.type === selectedType;

      return matchesDate && matchesYear && matchesHouse && matchesApartment && matchesType;
    });
  }, [allTransactions, selectedYear, selectedHouse, selectedApartment, selectedType, startDate, endDate]);

  const totalIncome = displayedTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = displayedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpenses;

  // =========================
  // CSV EXPORT (unverändert)
  // =========================
  const downloadCSV = () => {
    if (!displayedTransactions.length) {
      alert("Keine Daten gefunden.");
      return;
    }

    const headers = ["Datum", "Typ", "Kategorie", "Beschreibung", "Betrag", "Haus", "Wohnung"];

    const rows = displayedTransactions.map((t) => {
      const houseObj = houses.find((h) => h.id === t.houseId);
      const house = houseObj?.name || "-";
      const apartment =
        t.apartmentId && houseObj
          ? houseObj.apartments?.find((a) => a.id === t.apartmentId)?.name || "-"
          : "-";

      return [
        t.date || "",
        t.type || "",
        t.category || "",
        t.description || "",
        Number(t.amount || 0).toFixed(2),
        house,
        apartment,
      ];
    });

    const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `steuer_export_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendToTaxAdvisor = () => {
    window.location.href = "mailto:?subject=Steuer Export ImmoForge";
  };

  const formatMoney = (value) => `${Number(value).toFixed(2)} €`;

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={header}>
          <h1 style={title}>Steuer & Export</h1>
          <p style={subtitle}>Steuerdaten exportieren & für Steuerberater vorbereiten</p>
        </div>

        {/* NEUE BUCHUNG + BELEG-FOTO */}
        <div style={card}>
          <div style={cardTop}>
            <div style={iconWrap}>
              <Plus size={24} />
            </div>
            <div>
              <div style={cardTitle}>Neue Buchung hinzufügen</div>
              <div style={cardSubtitle}>Kosten, Einnahmen, Beschreibung + optional Beleg-Foto</div>
            </div>
          </div>

          {/* Formular-Grid */}
          <div style={addFormGrid}>
            {/* Haus */}
            <div style={field}>
              <Building2 size={18} />
              <select value={newEntry.houseId} onChange={handleNewEntryChange("houseId")} style={input}>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Wohnung */}
            <div style={field}>
              <Building2 size={18} />
              <select value={newEntry.apartmentId} onChange={handleNewEntryChange("apartmentId")} style={input}>
                <option value="">Keine spezifische Wohnung</option>
                {(houses.find((h) => h.id === newEntry.houseId)?.apartments || []).map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Datum */}
            <div style={field}>
              <Calendar size={18} />
              <input type="date" value={newEntry.date} onChange={handleNewEntryChange("date")} style={input} />
            </div>

            {/* Typ */}
            <div style={field}>
              <Receipt size={18} />
              <select value={newEntry.type} onChange={handleNewEntryChange("type")} style={input}>
                <option value="income">Einnahme</option>
                <option value="expense">Ausgabe</option>
              </select>
            </div>

            {/* Betrag */}
            <div style={field}>
              <Euro size={18} />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newEntry.amount}
                onChange={handleNewEntryChange("amount")}
                style={input}
              />
            </div>

            {/* Kategorie */}
            <div style={field}>
              <FileText size={18} />
              <input
                type="text"
                placeholder="Kategorie"
                value={newEntry.category}
                onChange={handleNewEntryChange("category")}
                style={input}
              />
            </div>
          </div>

          {/* Beschreibung */}
          <div style={{ ...field, marginTop: 14 }}>
            <FileText size={18} />
            <input
              type="text"
              placeholder="Beschreibung der Buchung..."
              value={newEntry.description}
              onChange={handleNewEntryChange("description")}
              style={{ ...input, flex: 1 }}
            />
          </div>

          {/* BELEG-FOTO BEREICH */}
          <div style={{ marginTop: 24, borderTop: "1px dashed #e2e8f0", paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Camera size={20} />
              <strong>Beleg-Foto (optional)</strong>
            </div>

            {!isCameraActive && !capturedPhoto && (
              <button onClick={startCameraBeleg} style={cameraBtn}>
                📸 Beleg jetzt fotografieren
              </button>
            )}

            {/* KAMERA LIVE */}
            {isCameraActive && (
              <div>
                <video ref={videoRef} autoPlay playsInline style={videoStyle} />
                <button onClick={takePhotoBeleg} style={photoBtn}>
                  Foto aufnehmen
                </button>
              </div>
            )}

            {/* FOTO VORSCHAU + OCR */}
            {capturedPhoto && (
              <div>
                <img src={capturedPhoto} alt="Beleg" style={photoPreview} />
                {ocrLoadingBeleg ? (
                  <p style={{ textAlign: "center", color: "#64748b" }}>OCR läuft...</p>
                ) : (
                  <pre style={ocrBox}>{ocrTextBeleg || "Kein Text erkannt"}</pre>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={saveWithBeleg} disabled={uploadingBeleg} style={saveWithBelegBtn}>
                    {uploadingBeleg ? "Speichert..." : "Beleg speichern + Buchung hinzufügen"}
                  </button>
                  <button onClick={() => { setCapturedPhoto(null); setOcrTextBeleg(""); }} style={secondaryBtn}>
                    Neues Foto
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FALLBACK: Normale Buchung ohne Foto */}
          <button
            style={{ ...downloadBtn, width: "100%", marginTop: 24, background: "#334155" }}
            onClick={handleAddEntry}
          >
            <Plus size={16} />
            Nur Buchung speichern (ohne Foto)
          </button>
        </div>

        {/* FILTER CARD (unverändert) */}
        <div style={card}>
          <div style={cardTop}>
            <div style={iconWrap}>
              <Filter size={24} />
            </div>
            <div>
              <div style={cardTitle}>Export Filter</div>
              <div style={cardSubtitle}>Zeitraum, Haus, Wohnung & Typ auswählen</div>
            </div>
          </div>

          <div style={filterGrid}>
            <div style={field}>
              <Calendar size={18} />
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={input}>
                {[2023, 2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div style={field}>
              <Building2 size={18} />
              <select value={selectedHouse} onChange={(e) => setSelectedHouse(e.target.value)} style={input}>
                <option value="all">Alle Häuser</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={field}>
              <Building2 size={18} />
              <select value={selectedApartment} onChange={(e) => setSelectedApartment(e.target.value)} style={input}>
                <option value="all">Alle Wohnungen</option>
                {selectedHouse !== "all" &&
                  houses
                    .find((h) => h.id === selectedHouse)
                    ?.apartments?.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {apt.name}
                      </option>
                    ))}
              </select>
            </div>

            <div style={field}>
              <Receipt size={18} />
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={input}>
                <option value="all">Alle Buchungen</option>
                <option value="income">Einnahmen</option>
                <option value="expense">Ausgaben</option>
              </select>
            </div>
          </div>

          <div style={dateGrid}>
            <div style={field}>
              <Calendar size={18} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={input} />
            </div>
            <div style={field}>
              <Calendar size={18} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={input} />
            </div>
          </div>
        </div>

        {/* KPI, ACTIONS, TABLE – komplett unverändert */}
        <div style={statsGrid}>
          <div style={statCard}>
            <div style={statIcon}><TrendingUp size={22} /></div>
            <div>
              <div style={statLabel}>Einnahmen</div>
              <div style={statValue}>{formatMoney(totalIncome)}</div>
            </div>
          </div>
          <div style={statCard}>
            <div style={statIcon}><TrendingDown size={22} /></div>
            <div>
              <div style={statLabel}>Ausgaben</div>
              <div style={statValue}>{formatMoney(totalExpenses)}</div>
            </div>
          </div>
          <div style={statCard}>
            <div style={statIcon}><Euro size={22} /></div>
            <div>
              <div style={statLabel}>Gewinn / Verlust</div>
              <div style={statValue}>{formatMoney(balance)}</div>
            </div>
          </div>
        </div>

        <div style={actionsGrid}>
          <div style={actionCard}>
            <div style={actionLeft}>
              <div style={actionIcon}><FileSpreadsheet size={22} /></div>
              <div>
                <div style={actionTitle}>CSV Export</div>
                <div style={actionDesc}>Für Excel & Steuerberater</div>
              </div>
            </div>
            <button style={downloadBtn} onClick={downloadCSV}>
              <Download size={16} /> Download
            </button>
          </div>

          <div style={actionCard}>
            <div style={actionLeft}>
              <div style={actionIcon}><Mail size={22} /></div>
              <div>
                <div style={actionTitle}>Steuerberater senden</div>
                <div style={actionDesc}>Export per E-Mail vorbereiten</div>
              </div>
            </div>
            <button style={secondaryBtn} onClick={sendToTaxAdvisor}>
              <Mail size={16} /> Öffnen
            </button>
          </div>

          <div style={actionCard}>
            <div style={actionLeft}>
              <div style={actionIcon}><FileText size={22} /></div>
              <div>
                <div style={actionTitle}>DATEV Export</div>
                <div style={actionDesc}>Buchhaltung & Kanzlei</div>
              </div>
            </div>
            <button style={disabledBtn}>Bald verfügbar</button>
          </div>
        </div>

        <div style={tableCard}>
          <div style={tableHeader}>
            <h2 style={tableTitle}>Export Vorschau</h2>
            <div style={tableCount}>{displayedTransactions.length} Buchungen</div>
          </div>

          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Datum</th>
                  <th style={th}>Typ</th>
                  <th style={th}>Kategorie</th>
                  <th style={th}>Beschreibung</th>
                  <th style={th}>Wohnung</th>
                  <th style={th}>Betrag</th>
                  <th style={th}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={td}>{t.date || "-"}</td>
                    <td style={td}>{t.type === "income" ? "Einnahme" : "Ausgabe"}</td>
                    <td style={td}>{t.category || "-"}</td>
                    <td style={td}>{t.description || "-"}</td>
                    <td style={td}>
                      {t.apartmentId
                        ? houses.find((h) => h.id === t.houseId)?.apartments?.find((a) => a.id === t.apartmentId)?.name || "-"
                        : "-"}
                    </td>
                    <td style={tdBold}>{formatMoney(t.amount)}</td>
                    <td style={{ ...td, textAlign: "center" }}>
                      {t.id?.startsWith("manual-") && (
                        <button style={deleteBtn} onClick={() => handleDeleteManual(t.id)}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Verstecktes Canvas für Foto */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

/* =========================
   STYLE SYSTEM (erweitert um Kamera-Stile)
========================= */

const page = { minHeight: "100vh", padding: "24px 16px", background: "#f6f7fb", fontFamily: "Inter, Arial", color: "#0f172a" };
const container = { maxWidth: 1100, margin: "0 auto" };
const header = { marginBottom: 28, textAlign: "center" };
const title = { fontSize: 36, fontWeight: 800, marginBottom: 8 };
const subtitle = { fontSize: 16, color: "#64748b" };
const card = { background: "white", borderRadius: 22, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,0.04)", marginBottom: 24 };
const cardTop = { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 };
const iconWrap = { width: 58, height: 58, borderRadius: 18, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" };
const cardTitle = { fontSize: 18, fontWeight: 700, marginBottom: 4 };
const cardSubtitle = { fontSize: 14, color: "#64748b" };
const filterGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 14 };
const dateGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 };
const addFormGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 };
const field = { display: "flex", alignItems: "center", gap: 10 };
const input = { width: "100%", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "white", fontSize: 14 };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 };
const statCard = { background: "white", borderRadius: 20, padding: 20, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" };
const statIcon = { width: 52, height: 52, borderRadius: 16, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" };
const statLabel = { fontSize: 14, color: "#64748b", marginBottom: 4 };
const statValue = { fontSize: 24, fontWeight: 800 };
const actionsGrid = { display: "grid", gap: 16, marginBottom: 24 };
const actionCard = { background: "white", borderRadius: 20, padding: 18, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" };
const actionLeft = { display: "flex", alignItems: "center", gap: 14 };
const actionIcon = { width: 52, height: 52, borderRadius: 16, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" };
const actionTitle = { fontSize: 17, fontWeight: 700, marginBottom: 4 };
const actionDesc = { fontSize: 14, color: "#64748b" };
const downloadBtn = { border: "none", background: "#0f172a", color: "white", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer" };
const secondaryBtn = { border: "1px solid #e2e8f0", background: "white", color: "#0f172a", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer" };
const disabledBtn = { border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", borderRadius: 12, padding: "12px 18px", fontWeight: 700 };
const tableCard = { background: "white", borderRadius: 22, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 8px 24px rgba(15,23,42,0.04)" };
const tableHeader = { padding: 20, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const tableTitle = { margin: 0, fontSize: 20, fontWeight: 800 };
const tableCount = { fontSize: 14, color: "#64748b", fontWeight: 600 };
const tableWrap = { overflowX: "auto" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: 16, background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 14, fontWeight: 700 };
const td = { padding: 16, borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#334155" };
const tdBold = { padding: 16, borderBottom: "1px solid #f1f5f9", fontSize: 14, fontWeight: 700 };
const deleteBtn = { background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" };

// Neue Kamera-Stile
const cameraBtn = { ...downloadBtn, background: "#0ea5e9", width: "100%" };
const photoBtn = { ...downloadBtn, background: "#10b981", width: "100%", marginTop: 12 };
const saveWithBelegBtn = { ...downloadBtn, background: "#10b981", flex: 1 };
const videoStyle = { width: "100%", borderRadius: 12, background: "#000", marginTop: 8 };
const photoPreview = { width: "100%", borderRadius: 12, marginTop: 8 };
const ocrBox = { whiteSpace: "pre-wrap", fontSize: 13, background: "#f8fafc", padding: 12, borderRadius: 10, marginTop: 12, maxHeight: 160, overflowY: "auto" };