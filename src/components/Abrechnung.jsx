import { useEffect, useState } from "react";
import { useImmo } from "../context/ImmoContext";
import { supabase } from "../supabase/supabaseClient";
import jsPDF from "jspdf";
import mammoth from "mammoth";

import {
  FileText,
  Home,
  Building2,
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

  const [showAnleitung, setShowAnleitung] = useState(false);
  const [showInputs, setShowInputs] = useState(true);

  const selectedHouse = houses.find(
    (h) => h.id === selectedHouseId
  );

  const selectedApartment =
    selectedHouse?.apartments?.find(
      (a) => a.id === selectedApartmentId
    );

  // =========================
  // LOAD TEMPLATES
  // =========================

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setTemplates(data || []);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // =========================
  // TEMPLATE UPLOAD
  // =========================

  const uploadTemplate = async (
    file,
    type
  ) => {
    if (!file) return;

    try {
      setUploading(true);

      const fileName = `${Date.now()}_${
        file.name
      }`;

      const { error: uploadError } =
        await supabase.storage
          .from("templates")
          .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        alert(uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicData } =
        supabase.storage
          .from("templates")
          .getPublicUrl(fileName);

      const user =
        await supabase.auth.getUser();

      const { error: insertError } =
        await supabase
          .from("document_templates")
          .insert({
            name: file.name,
            type,
            file_url:
              publicData.publicUrl,
            file_path: fileName,
            user_id:
              user.data.user?.id,
          });

      if (insertError) {
        console.error(insertError);
        alert(insertError.message);
        setUploading(false);
        return;
      }

      await loadTemplates();

      alert("Vorlage hochgeladen");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Upload");
    }

    setUploading(false);
  };

  // =========================
  // TEMPLATE DELETE
  // =========================

  const deleteTemplate = async (
    template
  ) => {
    const ok = window.confirm(
      `Vorlage "${template.name}" wirklich löschen?`
    );

    if (!ok) return;

    try {
      await supabase
        .from("document_templates")
        .delete()
        .eq("id", template.id);

      if (template.file_path) {
        await supabase.storage
          .from("templates")
          .remove([
            template.file_path,
          ]);
      }

      await loadTemplates();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen");
    }
  };

  // =========================
  // TEMPLATE FILTER
  // =========================

  const getTemplatesByType = (
    type
  ) => {
    return templates.filter(
      (t) => t.type === type
    );
  };

  // =========================
  // PLACEHOLDER SYSTEM
  // =========================

  const replacePlaceholders = (
    text
  ) => {
    const data = {
      mieter_name:
        manualData.mieter1 ||
        selectedApartment?.tenant ||
        "",

      mieter2:
        manualData.mieter2 || "",

      wohnung_name:
        selectedApartment?.name || "",

      haus_name:
        selectedHouse?.name || "",

      strasse:
        manualData.strasse || "",

      hausnummer:
        manualData.hausnummer || "",

      plz:
        manualData.plz || "",

      ort:
        manualData.ort || "",

      warmmiete: String(
        selectedApartment?.warmmiete ||
          ""
      ),

      kaltmiete: String(
        selectedApartment?.kaltmiete ||
          ""
      ),

      zeitraum_start:
        periodStart || "",

      zeitraum_ende:
        periodEnd || "",
    };

    let result = text;

    Object.entries(data).forEach(
      ([key, value]) => {
        const regex =
          new RegExp(
            `\\[\\[\\s*${key}\\s*\\]\\]`,
            "gi"
          );

        result = result.replace(
          regex,
          value || ""
        );
      }
    );

    return result;
  };

  // =========================
  // GENERATE FROM TEMPLATE
  // =========================

  const generateFromTemplate =
    async (template) => {
      if (!selectedApartment) {
        alert(
          "Bitte Wohnung auswählen"
        );
        return;
      }

      try {
        const response = await fetch(
          template.file_url
        );

        const arrayBuffer =
          await response.arrayBuffer();

        const result =
          await mammoth.extractRawText({
            arrayBuffer,
          });

        const rawText = result.value;

        const finalText =
          replacePlaceholders(rawText);

        const doc = new jsPDF();

        doc.setFontSize(12);

        const lines =
          doc.splitTextToSize(
            finalText,
            180
          );

        doc.text(lines, 15, 20);

        doc.save(
          `${template.type}.pdf`
        );
      } catch (err) {
        console.error(err);
        alert(
          "Fehler beim PDF erstellen"
        );
      }
    };

  // =========================
  // STANDARD PDF
  // =========================

  const generateNebenkostenPDF =
    () => {
      if (!selectedApartment) {
        alert(
          "Bitte Wohnung auswählen"
        );
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(20);

      doc.text(
        "Nebenkostenabrechnung",
        20,
        30
      );

      doc.setFontSize(12);

      doc.text(
        `Mieter: ${
          manualData.mieter1 ||
          selectedApartment?.tenant ||
          ""
        }`,
        20,
        55
      );

      doc.text(
        `Wohnung: ${
          selectedApartment?.name ||
          ""
        }`,
        20,
        65
      );

      doc.text(
        `Zeitraum: ${periodStart} - ${periodEnd}`,
        20,
        75
      );

      doc.text(
        `Warmmiete: ${
          selectedApartment?.warmmiete ||
          0
        } €`,
        20,
        85
      );

      doc.text(
        `Kaltmiete: ${
          selectedApartment?.kaltmiete ||
          0
        } €`,
        20,
        95
      );

      doc.save(
        "Nebenkostenabrechnung.pdf"
      );
    };

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}

        <div style={header}>
          <h1 style={title}>
            PDF Generator
          </h1>

          <p style={subtitle}>
            Vorlagen hochladen und
            automatisch ausfüllen
          </p>
        </div>

        {/* PDF ANLEITUNG */}

        <div
          style={collapsibleHeader}
          onClick={() =>
            setShowAnleitung(
              !showAnleitung
            )
          }
        >
          <div style={collapseLeft}>
            <Info size={20} />
            <span>
              PDF Anleitung
            </span>
          </div>

          {showAnleitung ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>

        {showAnleitung && (
          <div style={infoBox}>
            <h3 style={infoTitle}>
              Verfügbare Platzhalter
            </h3>

            <p style={infoText}>
              Nutze folgende
              Platzhalter in deiner
              Word-Datei (.docx):
            </p>

            <div
              style={placeholderGrid}
            >
              <div>
                [[mieter_name]]
              </div>

              <div>
                [[mieter2]]
              </div>

              <div>
                [[wohnung_name]]
              </div>

              <div>
                [[haus_name]]
              </div>

              <div>
                [[strasse]]
              </div>

              <div>
                [[hausnummer]]
              </div>

              <div>[[plz]]</div>

              <div>[[ort]]</div>

              <div>
                [[warmmiete]]
              </div>

              <div>
                [[kaltmiete]]
              </div>

              <div>
                [[zeitraum_start]]
              </div>

              <div>
                [[zeitraum_ende]]
              </div>
            </div>

            <div style={warningBox}>
              WICHTIG:
              <br />
              Platzhalter müssen
              exakt so geschrieben
              werden.
              <br />
              Nicht mehrere
              Schriftarten innerhalb
              eines Platzhalters
              verwenden.
            </div>
          </div>
        )}

        {/* INPUTS */}

        <div
          style={collapsibleHeader}
          onClick={() =>
            setShowInputs(
              !showInputs
            )
          }
        >
          <div style={collapseLeft}>
            <FileText size={20} />
            <span>
              Daten eingeben
            </span>
          </div>

          {showInputs ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>

        {showInputs && (
          <div style={card}>
            <div style={inputGroup}>

              {/* HAUS */}

              <div style={field}>
                <Home size={18} />

                <select
                  value={
                    selectedHouseId
                  }
                  onChange={(e) => {
                    setSelectedHouseId(
                      e.target.value
                    );

                    setSelectedApartmentId(
                      ""
                    );
                  }}
                  style={input}
                >
                  <option value="">
                    Haus auswählen
                  </option>

                  {houses.map((h) => (
                    <option
                      key={h.id}
                      value={h.id}
                    >
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* WOHNUNG */}

              {selectedHouse && (
                <div style={field}>
                  <Building2 size={18} />

                  <select
                    value={
                      selectedApartmentId
                    }
                    onChange={(e) =>
                      setSelectedApartmentId(
                        e.target.value
                      )
                    }
                    style={input}
                  >
                    <option value="">
                      Wohnung auswählen
                    </option>

                    {selectedHouse.apartments?.map(
                      (apt) => (
                        <option
                          key={apt.id}
                          value={apt.id}
                        >
                          {apt.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* MIETER */}

              <div style={field}>
                <input
                  placeholder="Mieter 1"
                  value={
                    manualData.mieter1
                  }
                  onChange={(e) =>
                    setManualData({
                      ...manualData,
                      mieter1:
                        e.target.value,
                    })
                  }
                  style={input}
                />
              </div>

              <div style={field}>
                <input
                  placeholder="Mieter 2"
                  value={
                    manualData.mieter2
                  }
                  onChange={(e) =>
                    setManualData({
                      ...manualData,
                      mieter2:
                        e.target.value,
                    })
                  }
                  style={input}
                />
              </div>

              {/* STRASSE */}

              <div style={doubleGrid}>
                <div style={field}>
                  <input
                    placeholder="Straße"
                    value={
                      manualData.strasse
                    }
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        strasse:
                          e.target.value,
                      })
                    }
                    style={input}
                  />
                </div>

                <div style={field}>
                  <input
                    placeholder="Hausnummer"
                    value={
                      manualData.hausnummer
                    }
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        hausnummer:
                          e.target.value,
                      })
                    }
                    style={input}
                  />
                </div>
              </div>

              {/* PLZ ORT */}

              <div style={doubleGrid}>
                <div style={field}>
                  <input
                    placeholder="PLZ"
                    value={
                      manualData.plz
                    }
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        plz:
                          e.target.value,
                      })
                    }
                    style={input}
                  />
                </div>

                <div style={field}>
                  <input
                    placeholder="Ort"
                    value={
                      manualData.ort
                    }
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        ort:
                          e.target.value,
                      })
                    }
                    style={input}
                  />
                </div>
              </div>

              {/* DATUM */}

              <div style={doubleGrid}>
                <div style={field}>
                  <input
                    type="date"
                    value={
                      periodStart
                    }
                    onChange={(e) =>
                      setPeriodStart(
                        e.target.value
                      )
                    }
                    style={input}
                  />
                </div>

                <div style={field}>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) =>
                      setPeriodEnd(
                        e.target.value
                      )
                    }
                    style={input}
                  />
                </div>
              </div>

              {/* PROZENT */}

              <div style={field}>
                <Percent size={18} />

                <input
                  type="number"
                  value={
                    sharePercentage
                  }
                  onChange={(e) =>
                    setSharePercentage(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  style={input}
                />
              </div>
            </div>
          </div>
        )}

        {/* PDF CARDS */}

        <div style={sectionTitle}>
          <FileText size={18} />
          Dokumente erstellen
        </div>

        <div style={actionsGrid}>

          <ActionCard
            title="Nebenkostenabrechnung"
            desc="Automatische Abrechnung"
            icon={
              <FilePlus2 size={22} />
            }
            templates={getTemplatesByType(
              "Nebenkostenabrechnung"
            )}
            onStandardClick={
              generateNebenkostenPDF
            }
            onTemplateClick={
              generateFromTemplate
            }
            uploadType="Nebenkostenabrechnung"
            onUpload={uploadTemplate}
            onDelete={deleteTemplate}
            uploading={uploading}
          />

          <ActionCard
            title="Mietvertrag"
            desc="Vertrag generieren"
            icon={
              <FileSignature size={22} />
            }
            templates={getTemplatesByType(
              "Mietvertrag"
            )}
            onStandardClick={() =>
              alert(
                "Standard Mietvertrag folgt"
              )
            }
            onTemplateClick={
              generateFromTemplate
            }
            uploadType="Mietvertrag"
            onUpload={uploadTemplate}
            onDelete={deleteTemplate}
            uploading={uploading}
          />

          <ActionCard
            title="Mahnung"
            desc="Zahlungserinnerung"
            icon={
              <FileWarning size={22} />
            }
            templates={getTemplatesByType(
              "Mahnung"
            )}
            onStandardClick={() =>
              alert(
                "Standard Mahnung folgt"
              )
            }
            onTemplateClick={
              generateFromTemplate
            }
            uploadType="Mahnung"
            onUpload={uploadTemplate}
            onDelete={deleteTemplate}
            uploading={uploading}
          />

          <ActionCard
            title="Übergabeprotokoll"
            desc="Wohnungsübergabe"
            icon={
              <ClipboardList size={22} />
            }
            templates={getTemplatesByType(
              "Übergabeprotokoll"
            )}
            onStandardClick={() =>
              alert(
                "Standard Übergabeprotokoll folgt"
              )
            }
            onTemplateClick={
              generateFromTemplate
            }
            uploadType="Übergabeprotokoll"
            onUpload={uploadTemplate}
            onDelete={deleteTemplate}
            uploading={uploading}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================
   ACTION CARD
========================= */

function ActionCard({
  title,
  desc,
  icon,
  templates,
  onStandardClick,
  onTemplateClick,
  uploadType,
  onUpload,
  onDelete,
  uploading,
}) {
  return (
    <div style={actionCard}>
      <div style={actionLeft}>
        <div style={actionIcon}>
          {icon}
        </div>

        <div>
          <div style={actionTitle}>
            {title}
          </div>

          <div style={actionDesc}>
            {desc}
          </div>
        </div>
      </div>

      <div style={actionButtons}>

        <button
          style={downloadBtn}
          onClick={onStandardClick}
        >
          <Download size={18} />
          Standard PDF
        </button>

        {templates.map((tpl) => (
          <div
            key={tpl.id}
            style={templateRow}
          >
            <button
              style={templateBtn}
              onClick={() =>
                onTemplateClick(tpl)
              }
            >
              <FileText size={16} />
              {tpl.name}
            </button>

            <button
              style={deleteBtn}
              onClick={() =>
                onDelete(tpl)
              }
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          style={uploadBtn}
          disabled={uploading}
          onClick={() => {
            const input =
              document.createElement(
                "input"
              );

            input.type = "file";
            input.accept = ".docx";

            input.onchange = (e) => {
              const file =
                e.target.files[0];

              if (file) {
                onUpload(
                  file,
                  uploadType
                );
              }
            };

            input.click();
          }}
        >
          <Upload size={16} />

          {uploading
            ? "Upload..."
            : "Vorlage hochladen"}
        </button>
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */

const page = {
  minHeight: "100vh",
  background: "#f6f7fb",
  padding: "24px 16px",
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
};

const header = {
  textAlign: "center",
  marginBottom: 24,
};

const title = {
  fontSize: 34,
  fontWeight: 800,
  color: "#0f172a",
};

const subtitle = {
  fontSize: 15,
  color: "#64748b",
};

const collapsibleHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  background: "white",
  borderRadius: 16,
  border:
    "1px solid #e2e8f0",
  padding: "16px 18px",
  marginBottom: 12,
  cursor: "pointer",
  fontWeight: 700,
};

const collapseLeft = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const infoBox = {
  background: "white",
  borderRadius: 18,
  border:
    "1px solid #e2e8f0",
  padding: 20,
  marginBottom: 20,
};

const infoTitle = {
  marginTop: 0,
};

const infoText = {
  color: "#475569",
  marginBottom: 14,
};

const placeholderGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 10,
  marginBottom: 18,
};

const warningBox = {
  background: "#f8fafc",
  borderRadius: 12,
  padding: 14,
  fontSize: 14,
  color: "#475569",
};

const card = {
  background: "white",
  borderRadius: 18,
  border:
    "1px solid #e2e8f0",
  padding: 20,
  marginBottom: 20,
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const field = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#f8fafc",
  border:
    "1px solid #e2e8f0",
  borderRadius: 14,
  padding: "0 14px",
};

const input = {
  flex: 1,
  height: 48,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 15,
};

const doubleGrid = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 12,
};

const sectionTitle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 700,
  marginBottom: 14,
};

const actionsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const actionCard = {
  background: "white",
  borderRadius: 18,
  border:
    "1px solid #e2e8f0",
  padding: 18,
  display: "flex",
  justifyContent:
    "space-between",
  gap: 20,
  alignItems: "center",
  flexWrap: "wrap",
};

const actionLeft = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const actionIcon = {
  width: 50,
  height: 50,
  borderRadius: 14,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const actionTitle = {
  fontWeight: 700,
  fontSize: 16,
};

const actionDesc = {
  fontSize: 13,
  color: "#64748b",
};

const actionButtons = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 220,
};

const templateRow = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const downloadBtn = {
  background: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
};

const uploadBtn = {
  background: "#f8fafc",
  border:
    "1px dashed #94a3b8",
  borderRadius: 12,
  padding: "10px 14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
};

const templateBtn = {
  flex: 1,
  background: "#f1f5f9",
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
};

const deleteBtn = {
  width: 42,
  height: 42,
  borderRadius: 10,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};