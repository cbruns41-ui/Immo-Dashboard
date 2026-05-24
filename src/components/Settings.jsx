import { useState, useEffect, useRef } from "react";
import { useImmo } from "../context/ImmoContext";
import { dataService } from "../services/dataService";
import { supabase } from "../supabase/supabaseClient";
import {
  User,
  CreditCard,
  Shield,
  FileText,
  Upload,
  Check,
  X,
  Megaphone,
} from "lucide-react";
import NewsAdmin from "./NewsAdmin";
import NewsAdminSetupHint from "./NewsAdminSetupHint";
import { useAppAdmin } from "../hooks/useAppAdmin";
import { useNotifications } from "../context/NotificationContext";

export default function Settings() {
  const { vermieter, setVermieter, saveVermieter, user } = useImmo();
  const { error: notifyError } = useNotifications();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState("personal");

  // PDF Logo Upload State
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const logoInputRef = useRef(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanging, setPasswordChanging] = useState(false);

  const { isAdmin: showNewsAdmin, checking: adminChecking } = useAppAdmin(user);

  const saveTimeout = useRef(null);
  const firstLoad = useRef(true);

  // =========================
  // INPUT CHANGE (UNVERÄNDERT)
  // =========================
  const handleChange = (e) => {
    setVermieter({
      ...vermieter,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // PDF LOGO UPLOAD
  // =========================
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setLogoUploading(true);

    try {
      const fileName = `${user.id}/logo_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('documents')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      const updated = { ...vermieter, logo_url: publicUrl };
      setVermieter(updated);
      await saveVermieter(updated);
      setMessage("✅ Logo erfolgreich hochgeladen");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Logo upload error:", error);
      setMessage("❌ Fehler beim Logo hochladen");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLogoUploading(false);
    }
  };

  // =========================
  // PASSWORD CHANGE
  // =========================
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("❌ Bitte alle Felder ausfüllen");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwörter stimmen nicht überein");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("❌ Passwort muss mindestens 6 Zeichen haben");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setPasswordChanging(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setMessage("✅ Passwort erfolgreich geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setMessage("❌ Fehler beim Passwort ändern");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setPasswordChanging(false);
    }
  };

  // =========================
  // AUTOSAVE (UNVERÄNDERT)
  // =========================
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    if (!user?.id) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        setSaving(true);

        const result = await dataService.saveVermieter(user.id, vermieter);

        if (!result.ok) {
          notifyError(result.message);
          setMessage("❌ Fehler beim Speichern");
          setTimeout(() => setMessage(""), 4000);
          return;
        }

        setMessage("✅ Automatisch gespeichert");
        setTimeout(() => setMessage(""), 2500);
      } catch (error) {
        console.error(error);
        notifyError("Einstellungen konnten nicht gespeichert werden.");
        setMessage("❌ Fehler beim Speichern");
        setTimeout(() => setMessage(""), 4000);
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [vermieter, user, user?.id]);

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <h1 style={title}>Einstellungen</h1>
          <p style={subtitle}>Verwaltung & persönliche Daten</p>
        </div>

        {/* NAV BUTTONS */}
        <div style={navGrid}>

          <button
            onClick={() => setActiveTab("personal")}
            style={{
              ...navBtn,
              ...(activeTab === "personal" ? navBtnActive : {})
            }}
          >
            <User size={18} />
            Persönliche Daten
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            style={{
              ...navBtn,
              ...(activeTab === "bank" ? navBtnActive : {})
            }}
          >
            <CreditCard size={18} />
            Bankdaten
          </button>

          <button
            onClick={() => setActiveTab("security")}
            style={{
              ...navBtn,
              ...(activeTab === "security" ? navBtnActive : {})
            }}
          >
            <Shield size={18} />
            Sicherheit
          </button>

          <button
            onClick={() => setActiveTab("pdf")}
            style={{
              ...navBtn,
              ...(activeTab === "pdf" ? navBtnActive : {})
            }}
          >
            <FileText size={18} />
            PDF Einstellungen
          </button>

          <button
            onClick={() => setActiveTab("news")}
            style={{
              ...navBtn,
              ...(activeTab === "news" ? navBtnActive : {}),
            }}
          >
            <Megaphone size={18} />
            Newsfeed
          </button>

        </div>

        {/* CONTENT */}
        <div style={contentCard}>

          {activeTab === "personal" && (
            <>
              <h3 style={sectionTitle}>
                Persönliche Daten (erscheinen in PDF-Abrechnungen)
              </h3>

              <input
                name="name"
                value={vermieter.name || ""}
                onChange={handleChange}
                placeholder="Vollständiger Name"
                style={input}
              />

              <input
                name="adresse"
                value={vermieter.adresse || ""}
                onChange={handleChange}
                placeholder="Straße + Hausnummer"
                style={input}
              />

              <div style={row}>
                <input
                  name="plz"
                  value={vermieter.plz || ""}
                  onChange={handleChange}
                  placeholder="PLZ"
                  style={{ ...input, flex: 1 }}
                />

                <input
                  name="ort"
                  value={vermieter.ort || ""}
                  onChange={handleChange}
                  placeholder="Ort"
                  style={{ ...input, flex: 2 }}
                />
              </div>

              <input
                name="telefon"
                value={vermieter.telefon || ""}
                onChange={handleChange}
                placeholder="Telefon"
                style={input}
              />

              <input
                name="email"
                value={vermieter.email || ""}
                onChange={handleChange}
                placeholder="E-Mail"
                style={input}
              />
            </>
          )}

          {activeTab === "bank" && (
            <>
              <h3 style={sectionTitle}>
                Bankdaten (erscheinen in PDF-Abrechnungen)
              </h3>

              <input
                name="bankname"
                value={vermieter.bankname || ""}
                onChange={handleChange}
                placeholder="Bankname"
                style={input}
              />

              <input
                name="iban"
                value={vermieter.iban || ""}
                onChange={handleChange}
                placeholder="IBAN (DE89 3704 0044 0532 0130 00)"
                style={input}
              />

              <input
                name="bic"
                value={vermieter.bic || ""}
                onChange={handleChange}
                placeholder="BIC (COBADEFFXXX)"
                style={input}
              />

              <div style={row}>
                <input
                  name="kontoinhaber"
                  value={vermieter.kontoinhaber || ""}
                  onChange={handleChange}
                  placeholder="Kontoinhaber"
                  style={{ ...input, flex: 2 }}
                />

                <input
                  name="kontonummer"
                  value={vermieter.kontonummer || ""}
                  onChange={handleChange}
                  placeholder="Kontonummer"
                  style={{ ...input, flex: 1 }}
                />
              </div>

              <input
                name="blz"
                value={vermieter.blz || ""}
                onChange={handleChange}
                placeholder="Bankleitzahl (BLZ)"
                style={input}
              />
            </>
          )}

          {activeTab === "security" && (
            <>
              <h3 style={sectionTitle}>
                Sicherheit
              </h3>

              <div style={securityCard}>
                <div style={securityIcon}>
                  <Shield size={32} />
                </div>
                <div style={securityContent}>
                  <h4 style={securityTitle}>Passwort ändern</h4>
                  <p style={securityDescription}>
                    Ändere dein Passwort regelmäßig für mehr Sicherheit.
                  </p>
                  <div style={passwordForm}>
                    <input
                      type="password"
                      placeholder="Aktuelles Passwort"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={passwordInput}
                    />
                    <input
                      type="password"
                      placeholder="Neues Passwort"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={passwordInput}
                    />
                    <input
                      type="password"
                      placeholder="Passwort bestätigen"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={passwordInput}
                    />
                    <button 
                      onClick={handlePasswordChange}
                      disabled={passwordChanging}
                      style={securityButton}
                    >
                      {passwordChanging ? "Ändere..." : "Passwort ändern"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={securityCard}>
                <div style={securityIcon}>
                  <Shield size={32} />
                </div>
                <div style={securityContent}>
                  <h4 style={securityTitle}>Zwei-Faktor-Authentifizierung</h4>
                  <p style={securityDescription}>
                    Aktiviere 2FA für zusätzlichen Schutz deines Accounts.
                  </p>
                  <button style={securityButton} disabled>
                    2FA aktivieren (Bald verfügbar)
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "pdf" && (
            <>
              <h3 style={sectionTitle}>
                PDF Einstellungen
              </h3>

              <div style={pdfCard}>
                <div style={pdfIcon}>
                  <FileText size={32} />
                </div>
                <div style={pdfContent}>
                  <h4 style={pdfTitle}>PDF-Logo hochladen</h4>
                  <p style={pdfDescription}>
                    Lade dein Firmenlogo hoch, das in PDF-Abrechnungen erscheint.
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    style={pdfButton}
                  >
                    {logoUploading ? "Lädt..." : "Logo hochladen"}
                  </button>
                  {logoUrl && (
                    <div style={logoPreview}>
                      <Check size={16} />
                      <span>Logo hochgeladen</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={pdfCard}>
                <div style={pdfIcon}>
                  <FileText size={32} />
                </div>
                <div style={pdfContent}>
                  <h4 style={pdfTitle}>PDF-Vorlage auswählen</h4>
                  <p style={pdfDescription}>
                    Wähle aus verschiedenen PDF-Vorlagen für deine Abrechnungen.
                  </p>
                  <button style={pdfButton} disabled>
                    Vorlage auswählen (Bald verfügbar)
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "news" && (
            adminChecking ? (
              <p style={{ color: "#64748b" }}>Admin-Rechte werden geprüft…</p>
            ) : showNewsAdmin ? (
              <NewsAdmin />
            ) : (
              <NewsAdminSetupHint userEmail={user?.email} />
            )
          )}

          {/* STATUS */}
          <div style={statusBox}>
            {saving ? (
              <p style={statusText}>💾 Speichert...</p>
            ) : message ? (
              <p
                style={{
                  ...statusText,
                  color: message.includes("✅") ? "#0f172a" : "#dc2626"
                }}
              >
                {message}
              </p>
            ) : (
              <p style={{ color: "#64748b", fontSize: 13 }}>
                Änderungen werden automatisch gespeichert
              </p>
            )}
          </div>

        </div>

        {user?.id && (
          <div style={migrationCard}>
            <h3 style={migrationTitle}>Datenbank-Updates (Supabase)</h3>
            <p style={migrationText}>
              Nach App-Updates ggf. im Supabase SQL Editor ausführen:
            </p>
            <ul style={migrationList}>
              <li>
                <code>supabase-migrations/appointments_maintenance_interval.sql</code>{" "}
                – Wartungsintervalle für Termine
              </li>
              <li>
                <code>supabase-migrations/apartments_tenant_contact.sql</code>{" "}
                – Telefon & E-Mail der Mieter
              </li>
            </ul>
            <p style={migrationHint}>
              Ohne diese Migrationen erscheint beim Speichern eine Fehlermeldung
              (Toast oben).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE – Gradient Design iOS/Android
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
  marginBottom: 32
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 8,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  margin: 0,
  color: "#64748b",
  fontWeight: 500
};

const navGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 28
};

const navBtn = {
  padding: 16,
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  cursor: "pointer",
  fontWeight: 700,
  color: "#0f172a",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "all 0.3s ease"
};

const navBtnActive = {
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  border: "2px solid #3b82f6",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
};

const contentCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 32,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
};

const sectionTitle = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 22,
  color: "#1e293b"
};

const subTitle = {
  marginTop: 20,
  marginBottom: 12,
  color: "#1e293b",
  fontWeight: 700
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  fontSize: 15,
  fontWeight: 500,
  color: "#1e293b",
  background: "white",
  transition: "all 0.2s ease",
  boxSizing: "border-box"
};

const row = {
  display: "flex",
  gap: 14,
  marginBottom: 10
};

const statusBox = {
  marginTop: 18,
  textAlign: "center",
  minHeight: 28
};

const statusText = {
  margin: 0,
  fontWeight: 700
};

/* Security & PDF Card Styles */
const securityCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  padding: 24,
  borderRadius: 20,
  border: "2px solid #e2e8f0",
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
};

const securityIcon = {
  width: 64,
  height: 64,
  borderRadius: 16,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
  flexShrink: 0
};

const securityContent = {
  flex: 1
};

const securityTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8
};

const securityDescription = {
  fontSize: 14,
  color: "#64748b",
  fontWeight: 500,
  marginBottom: 16,
  lineHeight: 1.5
};

const securityButton = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};

const pdfCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  padding: 24,
  borderRadius: 20,
  border: "2px solid #e2e8f0",
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
};

const pdfIcon = {
  width: 64,
  height: 64,
  borderRadius: 16,
  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
  flexShrink: 0
};

const pdfContent = {
  flex: 1
};

const pdfTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8
};

const pdfDescription = {
  fontSize: 14,
  color: "#64748b",
  fontWeight: 500,
  marginBottom: 16,
  lineHeight: 1.5
};

const pdfButton = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
  transition: "all 0.2s ease"
};

const passwordForm = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 16
};

const passwordInput = {
  padding: 12,
  borderRadius: 10,
  border: "2px solid #e2e8f0",
  fontSize: 14,
  fontWeight: 500,
  color: "#1e293b",
  background: "white",
  transition: "all 0.2s ease"
};

const logoPreview = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  padding: 8,
  borderRadius: 8,
  background: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
  color: "#166534",
  fontSize: 13,
  fontWeight: 600
};

const migrationCard = {
  marginTop: 28,
  padding: 24,
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  border: "2px solid #fde68a",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
};

const migrationTitle = {
  margin: "0 0 12px",
  fontSize: 18,
  fontWeight: 800,
  color: "#92400e",
};

const migrationText = {
  margin: "0 0 8px",
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.5,
};

const migrationList = {
  margin: "0 0 12px",
  paddingLeft: 20,
  fontSize: 13,
  color: "#475569",
  lineHeight: 1.6,
};

const migrationHint = {
  margin: 0,
  fontSize: 13,
  color: "#92400e",
  fontWeight: 600,
};

const emptyState = {
  textAlign: "center",
  color: "#64748b",
  padding: 30,
  fontSize: 16,
  fontWeight: 500
};