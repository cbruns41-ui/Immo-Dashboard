import { useEffect, useState } from "react";
import { useImmo } from "../context/ImmoContext";
import { useNotifications } from "../context/NotificationContext";
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
  const { error: notifyError, success: notifySuccess, warning: notifyWarning, info: notifyInfo } =
    useNotifications();

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
  const [showInputs, setShowInputs] = useState(false);

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
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setTemplates([]);
      return;
    }

    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .eq("user_id", userId)
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
        notifyError(uploadError.message);
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
        notifyError(insertError.message);
        setUploading(false);
        return;
      }

      await loadTemplates();

      notifySuccess("Vorlage hochgeladen");
    } catch (err) {
      console.error(err);
      notifyError("Fehler beim Upload");
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      await supabase
        .from("document_templates")
        .delete()
        .eq("id", template.id)
        .eq("user_id", userId);

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
      notifyError("Fehler beim Löschen");
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

      mieter:
        manualData.mieter1 ||
        selectedApartment?.tenant ||
        "",

      mieter2:
        manualData.mieter2 || "",

      wohnung_name:
        selectedApartment?.name || "",

      wohnung:
        selectedApartment?.name || "",

      haus_name:
        selectedHouse?.name || "",

      haus:
        selectedHouse?.name || "",

      strasse:
        manualData.strasse ||
        selectedHouse?.street ||
        "",

      hausnummer:
        manualData.hausnummer ||
        selectedHouse?.houseNumber ||
        "",

      plz:
        manualData.plz || "",

      ort:
        manualData.ort ||
        selectedHouse?.city ||
        "",

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

      startdatum:
        periodStart || "",

      enddatum:
        periodEnd || "",
    };

    let result = text;
    let replacedCount = 0;

    Object.entries(data).forEach(
      ([key, value]) => {
        // Support multiple placeholder formats
        const patterns = [
          `[[${key}]]`,
          `[[ ${key} ]]`,
          `{{${key}}}`,
          `{{ ${key} }}`,
          `{${key}}`,
          `{ ${key} }`,
          `%${key}%`,
          `%${key}%`,
          `#${key}#`,
          `#${key} #`
        ];

        patterns.forEach(pattern => {
          const regex = new RegExp(
            pattern.replace(/[[\]{}%#]/g, '\\$&'),
            "gi"
          );

          const matches = result.match(regex);
          if (matches && matches.length > 0) {
            result = result.replace(regex, value || "");
            replacedCount += matches.length;
          }
        });
      }
    );

    console.log(`Replaced ${replacedCount} placeholders in document`);
    
    return result;
  };

  // =========================
  // GENERATE FROM TEMPLATE
  // =========================

  const generateFromTemplate =
    async (template) => {
      if (!selectedApartment) {
        notifyWarning("Bitte Wohnung auswählen");
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
        notifyError("Fehler beim PDF erstellen");
      }
    };

  // =========================
  // STANDARD PDF
  // =========================

  const generateNebenkostenPDF =
    () => {
      if (!selectedApartment) {
        notifyWarning("Bitte Wohnung auswählen");
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
              notifyInfo("Standard-Mietvertrag folgt in Kürze")
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
              notifyInfo("Standard-Mahnung folgt in Kürze")
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
              notifyInfo("Standard-Übergabeprotokoll folgt in Kürze")
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
   STYLES – Gradient Design iOS/Android
========================= */

const page = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  padding: "24px 16px 100px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a"
};

const container = {
  maxWidth: 1200,
  margin: "0 auto"
};

const header = {
  textAlign: "center",
  marginBottom: 32
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
  fontWeight: 500
};

const collapsibleHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 18,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: "16px 18px",
  marginBottom: 12,
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease"
};

const collapseLeft = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const infoBox = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const infoTitle = {
  marginTop: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a"
};

const infoText = {
  color: "#475569",
  marginBottom: 14,
  fontWeight: 500
};

const placeholderGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginBottom: 18
};

const warningBox = {
  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
  borderRadius: 14,
  padding: 16,
  fontSize: 14,
  color: "#92400e",
  fontWeight: 600,
  border: "2px solid #fbbf24"
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 14
};

const field = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px solid #e2e8f0",
  borderRadius: 14,
  padding: "0 14px"
};

const input = {
  flex: 1,
  height: 48,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 16,
  fontWeight: 500,
  color: "#0f172a"
};

const doubleGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 14
};

const sectionTitle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 800,
  marginBottom: 16,
  color: "#0f172a",
  fontSize: 18
};

const actionsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: 16
};

const actionCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "center",
  flexWrap: "wrap",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const actionLeft = {
  display: "flex",
  alignItems: "center",
  gap: 16
};

const actionIcon = {
  width: 52,
  height: 52,
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
};

const actionTitle = {
  fontWeight: 800,
  fontSize: 16,
  color: "#1e293b"
};

const actionDesc = {
  fontSize: 13,
  color: "#64748b",
  fontWeight: 500
};

const actionButtons = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minWidth: 220
};

const templateRow = {
  display: "flex",
  gap: 10,
  alignItems: "center"
};

const downloadBtn = {
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "12px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};

const uploadBtn = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px dashed #94a3b8",
  borderRadius: 14,
  padding: "12px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  color: "#1e293b",
  transition: "all 0.2s ease"
};

const templateBtn = {
  flex: 1,
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  border: "none",
  borderRadius: 12,
  padding: "12px 14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  color: "#1e293b",
  transition: "all 0.2s ease"
};

const deleteBtn = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  transition: "all 0.2s ease"
};