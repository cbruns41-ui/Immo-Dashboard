import { useState } from "react";

import {
  LayoutDashboard,
  Home,
  TrendingUp,
  FileText,
  Calendar,
  Camera,
  FolderOpen,
  Settings as SettingsIcon,
  ArrowLeft,
} from "lucide-react";

import Dashboard from "./components/Dashboard";
import Houses from "./components/Houses";
import Appointments from "./components/Appointments";
import Finances from "./components/Finances";
import Abrechnung from "./components/Abrechnung";
import SettingsPage from "./components/Settings";
import Cashflow from "./components/Cashflow.jsx";
import Documents from "./components/Documents";
import DocumentsManager from "./components/DocumentsManager";

import InstallButton from "./components/InstallButton.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const isHome = currentPage === "home";

  const navigate = (page) => setCurrentPage(page);
  const goHome = () => setCurrentPage("home");

  const tiles = [
    { id: "uebersicht", label: "Übersicht", icon: LayoutDashboard, desc: "KPIs & Überblick" },
    { id: "houses", label: "Häuser", icon: Home, desc: "Objekte verwalten" },
    { id: "cashflow", label: "Cashflow", icon: TrendingUp, desc: "Einnahmen & Ausgaben" },
    { id: "abrechnung", label: "Abrechnung", icon: FileText, desc: "Nebenkosten" },
    { id: "appointments", label: "Termine", icon: Calendar, desc: "Besichtigungen" },
    { id: "documents", label: "Dokumente", icon: Camera, desc: "Scans & Fotos" },
    { id: "documentsmanager", label: "Manager", icon: FolderOpen, desc: "Dateiverwaltung" },
    { id: "einstellungen", label: "Settings", icon: SettingsIcon, desc: "Konfiguration" },
  ];

  return (
    <div style={page}>
      {/* BACK BUTTON */}
      {!isHome && (
        <button onClick={goHome} style={backBtn}>
          <ArrowLeft size={18} />
          Home
        </button>
      )}

      {/* HOME */}
      {isHome && (
        <div style={container}>
          <div style={header}>
            <h1 style={title}>ImmoForge</h1>
            <p style={subtitle}>Immobilien Management System</p>
          </div>

          <div style={grid}>
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(t.id)}
                  style={card}
                >
                  <div style={iconBox}>
                    <Icon size={18} />
                  </div>

                  <div>
                    <div style={label}>{t.label}</div>
                    <div style={desc}>{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PAGES */}
      {currentPage === "uebersicht" && <Dashboard />}
      {currentPage === "houses" && <Houses />}
      {currentPage === "appointments" && <Appointments />}
      {currentPage === "finanzen" && <Finances />}
      {currentPage === "cashflow" && <Cashflow />}
      {currentPage === "abrechnung" && <Abrechnung />}
      {currentPage === "documents" && <Documents />}
      {currentPage === "documentsmanager" && <DocumentsManager />}
      {currentPage === "einstellungen" && <SettingsPage />}

      <InstallButton />
    </div>
  );
}

/* =========================
   SAAS STYLE
========================= */

const page = {
  minHeight: "100vh",
  padding: 24,
  background: "#f6f7fb",
  fontFamily: "Inter, Arial",
  color: "#0f172a",
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
};

const header = {
  marginBottom: 24,
};

const title = {
  fontSize: 34,
  fontWeight: 800,
  marginBottom: 4,
};

const subtitle = {
  fontSize: 14,
  color: "#64748b",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
};

/* CARD */
const card = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 16,
  borderRadius: 14,
  background: "white",
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  cursor: "pointer",
  textAlign: "left",
};

const iconBox = {
  width: 34,
  height: 34,
  borderRadius: 10,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const label = {
  fontSize: 14,
  fontWeight: 600,
};

const desc = {
  fontSize: 12,
  color: "#64748b",
};

const backBtn = {
  position: "fixed",
  top: 18,
  left: 18,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 999,
  background: "white",
  border: "1px solid #e2e8f0",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};