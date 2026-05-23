import { useEffect, useState } from "react";
import { useImmo } from "../context/ImmoContext";
import { supabase } from "../supabase/supabaseClient";
import jsPDF from "jspdf";
import mammoth from "mammoth";
import {
  FileText,
  Home,
  Building2,
  Calendar,
  Percent,
  Download,
  Upload,
  Trash2,
  FileSignature,
  FileWarning,
  ClipboardList,
  Info,
  FilePlus2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Abrechnung() {
  const { houses } = useImmo();

  const [templates, setTemplates] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Manuelle Eingabefelder
  const [manualData, setManualData] = useState({
    mieter1: "",
    mieter2: "",
    strasse: "",
    hausnummer: "",
    plz: "",
    ort: "",
  });

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [sharePercentage, setSharePercentage] = useState(100);

  // Dropdowns standardmäßig zugeklappt
  const [showAnleitung, setShowAnleitung] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  const selectedHouse = houses.find((h) => h.id === selectedHouseId);
  const selectedApartment = selectedHouse?.apartments?.find(
    (a) => a.id === selectedApartmentId
  );

  // Templates laden
  const loadTemplates = async () => {
    const { data } = await supabase
      .from("pdf_templates")
      .select("*")
      .order("created_at", { ascending: false });
    setTemplates(data || []);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Vorlage hochladen
  const uploadTemplate = async (file, type) => {
    if (!file) return;
    setUploading(true);

    const fileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("pdf-templates")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("pdf-templates")
      .getPublicUrl(fileName);

    await supabase.from("pdf_templates").insert({
      name: file.name,
      type: type,
      file_url: urlData.publicUrl,
      file_path: fileName,
    });

    await loadTemplates();
    setUploading(false);
  };

  const deleteTemplate = async (template) => {
    if (!window.confirm("Vorlage wirklich löschen?")) return;
    await supabase.from("pdf_templates").delete().eq("id", template.id);
    await loadTemplates();
  };

  // Platzhalter ersetzen (automatisch + manuell)
  const replacePlaceholders = (text) => {
    const data = {
      mieter_name: manualData.mieter1 || selectedApartment?.tenant || "",
      mieter2: manualData.mieter2 || "",
      wohnung_name: selectedApartment?.name || "",
      haus_name: selectedHouse?.name || "",
      strasse: manualData.strasse || "",
      hausnummer: manualData.hausnummer || "",
      plz: manualData.plz || "",
      ort: manualData.ort || "",
      warmmiete: String(selectedApartment?.warmmiete || 0),
      kaltmiete: String(selectedApartment?.kaltmiete || 0),
      zeitraum_start: periodStart || "",
      zeitraum_ende: periodEnd || "",
    };

    let result = text;
    Object.keys(data).forEach((key) => {
      result = result.replaceAll(`{{${key}}}`, data[key]);
    });
    return result;
  };

  // PDF aus Vorlage generieren
  const generateFromTemplate = async (template) => {
    if (!selectedApartment) return alert("Bitte Wohnung auswählen");

    try {
      const res = await fetch(template.file_url);
      const arrayBuffer = await res.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      const finalText = replacePlaceholders(value);

      const doc = new jsPDF();
      const lines = doc.splitTextToSize(finalText, 180);
      doc.setFontSize(12);
      doc.text(lines, 15, 20);
      doc.save(`${template.type}.pdf`);
    } catch (err) {
      alert("Fehler beim Erstellen des PDFs");
    }
  };

  // Standard Nebenkosten PDF
  const generateNebenkostenPDF = () => {
    if (!selectedApartment) return alert("Bitte Wohnung auswählen");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Nebenkostenabrechnung", 20, 30);
    doc.setFontSize(12);
    doc.text(`Mieter: ${manualData.mieter1 || selectedApartment.tenant || ""}`, 20, 50);
    doc.text(`Wohnung: ${selectedApartment.name || ""}`, 20, 60);
    doc.text(`Zeitraum: ${periodStart} – ${periodEnd}`, 20, 70);
    doc.save("Nebenkostenabrechnung.pdf");
  };

  const getTemplatesByType = (type) => templates.filter((t) => t.type === type);

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <h1 style={title}>PDF Generator</h1>
          <p style={subtitle}>Vorlagen hochladen und automatisch ausfüllen</p>
        </div>

        {/* PDF Anleitung */}
        <div style={collapsibleHeader} onClick={() => setShowAnleitung(!showAnleitung)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Info size={20} />
            <span style={{ fontWeight: 700 }}>PDF Anleitung</span>
          </div>
          {showAnleitung ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showAnleitung && (
          <div style={infoBox}>
            <h4>Verfügbare Platzhalter:</h4>
            <div style={placeholderList}>
              <div>{"{{mieter_name}}"}</div>
              <div>{"{{mieter2}}"}</div>
              <div>{"{{wohnung_name}}"}</div>
              <div>{"{{haus_name}}"}</div>
              <div>{"{{strasse}}"}</div>
              <div>{"{{hausnummer}}"}</div>
              <div>{"{{plz}}"}</div>
              <div>{"{{ort}}"}</div>
              <div>{"{{warmmiete}}"}</div>
              <div>{"{{kaltmiete}}"}</div>
              <div>{"{{zeitraum_start}}"}</div>
              <div>{"{{zeitraum_ende}}"}</div>
            </div>
            <p style={{ marginTop: 16, fontSize: 14, color: "#475569" }}>
              Lade deine .docx-Vorlage hoch. Alle Platzhalter werden automatisch durch die eingegebenen Daten ersetzt.
            </p>
          </div>
        )}

        {/* Daten eingeben */}
        <div style={collapsibleHeader} onClick={() => setShowInputs(!showInputs)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} />
            <span style={{ fontWeight: 700 }}>Daten eingeben / überschreiben</span>
          </div>
          {showInputs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showInputs && (
          <div style={card}>
            <div style={inputGroup}>
              <div style={field}>
                <Home size={18} />
                <select value={selectedHouseId} onChange={(e) => { setSelectedHouseId(e.target.value); setSelectedApartmentId(""); }} style={input}>
                  <option value="">Haus auswählen</option>
                  {houses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              {selectedHouse && (
                <div style={field}>
                  <Building2 size={18} />
                  <select value={selectedApartmentId} onChange={(e) => setSelectedApartmentId(e.target.value)} style={input}>
                    <option value="">Wohnung auswählen</option>
                    {selectedHouse.apartments?.map((apt) => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={field}>
                <input placeholder="Mieter 1" value={manualData.mieter1} onChange={(e) => setManualData({ ...manualData, mieter1: e.target.value })} style={input} />
              </div>
              <div style={field}>
                <input placeholder="Mieter 2" value={manualData.mieter2} onChange={(e) => setManualData({ ...manualData, mieter2: e.target.value })} style={input} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={field}>
                  <input placeholder="Straße" value={manualData.strasse} onChange={(e) => setManualData({ ...manualData, strasse: e.target.value })} style={input} />
                </div>
                <div style={field}>
                  <input placeholder="Hausnummer" value={manualData.hausnummer} onChange={(e) => setManualData({ ...manualData, hausnummer: e.target.value })} style={input} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={field}>
                  <input placeholder="PLZ" value={manualData.plz} onChange={(e) => setManualData({ ...manualData, plz: e.target.value })} style={input} />
                </div>
                <div style={field}>
                  <input placeholder="Ort" value={manualData.ort} onChange={(e) => setManualData({ ...manualData, ort: e.target.value })} style={input} />
                </div>
              </div>

              <div style={dateRow}>
                <div style={field}>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={input} />
                </div>
                <div style={field}>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={input} />
                </div>
              </div>

              <div style={field}>
                <Percent size={18} />
                <input type="number" value={sharePercentage} onChange={(e) => setSharePercentage(Number(e.target.value))} style={input} />
              </div>
            </div>
          </div>
        )}

        {/* PDF Karten */}
        <div style={sectionTitle}>
          <FileText size={18} />
          Dokumente erstellen
        </div>

        <div style={actionsGrid}>
          <ActionCard
            title="Nebenkostenabrechnung"
            desc="Automatisch berechnete Abrechnung"
            icon={<FilePlus2 size={22} />}
            type="Nebenkostenabrechnung"
            templates={getTemplatesByType("Nebenkostenabrechnung")}
            onStandardClick={generateNebenkostenPDF}
            onTemplateClick={generateFromTemplate}
            uploadType="Nebenkostenabrechnung"
            onUpload={uploadTemplate}
          />

          <ActionCard
            title="Mietvertrag"
            desc="Vertrag aus Vorlage generieren"
            icon={<FileSignature size={22} />}
            type="Mietvertrag"
            templates={getTemplatesByType("Mietvertrag")}
            onStandardClick={() => alert("Standard Mietvertrag wird noch vorbereitet")}
            onTemplateClick={generateFromTemplate}
            uploadType="Mietvertrag"
            onUpload={uploadTemplate}
          />

          <ActionCard
            title="Mahnung"
            desc="Zahlungserinnerung erstellen"
            icon={<FileWarning size={22} />}
            type="Mahnung"
            templates={getTemplatesByType("Mahnung")}
            onStandardClick={() => alert("Standard Mahnung wird noch vorbereitet")}
            onTemplateClick={generateFromTemplate}
            uploadType="Mahnung"
            onUpload={uploadTemplate}
          />

          <ActionCard
            title="Übergabeprotokoll"
            desc="Wohnungsübergabe dokumentieren"
            icon={<ClipboardList size={22} />}
            type="Übergabeprotokoll"
            templates={getTemplatesByType("Übergabeprotokoll")}
            onStandardClick={() => alert("Standard Übergabeprotokoll wird noch vorbereitet")}
            onTemplateClick={generateFromTemplate}
            uploadType="Übergabeprotokoll"
            onUpload={uploadTemplate}
          />
        </div>
      </div>
    </div>
  );
}

/* ====================== ACTION CARD ====================== */
function ActionCard({ title, desc, icon, type, templates, onStandardClick, onTemplateClick, uploadType, onUpload }) {
  return (
    <div style={actionCard}>
      <div style={actionLeft}>
        <div style={actionIcon}>{icon}</div>
        <div>
          <div style={actionTitle}>{title}</div>
          <div style={actionDesc}>{desc}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
        <button style={downloadBtn} onClick={onStandardClick}>
          <Download size={18} />
          Standard PDF
        </button>

        {templates.map((tpl) => (
          <button key={tpl.id} style={templateBtn} onClick={() => onTemplateClick(tpl)}>
            <FileText size={16} />
            {tpl.name}
          </button>
        ))}

        <button
          style={uploadSmallBtn}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".docx";
            input.onchange = (e) => e.target.files[0] && onUpload(e.target.files[0], uploadType);
            input.click();
          }}
        >
          <Upload size={16} />
          Vorlage hochladen
        </button>
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const page = { minHeight: "100vh", background: "#f6f7fb", padding: "24px 16px" };
const container = { maxWidth: 1100, margin: "0 auto" };
const header = { textAlign: "center", marginBottom: 26 };
const title = { fontSize: 34, fontWeight: 800, color: "#0f172a" };
const subtitle = { fontSize: 15, color: "#64748b" };

const collapsibleHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "white",
  padding: "16px 20px",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  marginBottom: 12,
  cursor: "pointer",
  fontWeight: 700,
};

const card = { background: "white", borderRadius: 18, padding: 20, border: "1px solid #e2e8f0", marginBottom: 22 };
const inputGroup = { display: "flex", flexDirection: "column", gap: 14 };
const field = { display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", padding: "0 14px" };
const input = { flex: 1, height: 48, border: "none", background: "transparent", outline: "none", fontSize: 15 };
const dateRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

const infoBox = { background: "#fff", borderRadius: 18, padding: 20, border: "1px solid #e2e8f0", marginBottom: 20 };
const placeholderList = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, fontSize: 14, color: "#475569" };

const sectionTitle = { display: "flex", alignItems: "center", gap: 10, fontWeight: 700, marginBottom: 14, marginTop: 10 };
const actionsGrid = { display: "flex", flexDirection: "column", gap: 14 };

const actionCard = { background: "white", borderRadius: 18, border: "1px solid #e2e8f0", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 };
const actionLeft = { display: "flex", alignItems: "center", gap: 14 };
const actionIcon = { width: 48, height: 48, borderRadius: 14, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" };
const actionTitle = { fontWeight: 700, fontSize: 16 };
const actionDesc = { fontSize: 13, color: "#64748b" };

const downloadBtn = { background: "#0f172a", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 };
const templateBtn = { background: "#f1f5f9", color: "#0f172a", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 };
const uploadSmallBtn = { background: "#f1f5f9", color: "#0f172a", border: "1px dashed #64748b", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 };