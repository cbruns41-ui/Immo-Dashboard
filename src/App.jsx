import { useState } from "react";

import {
  LayoutDashboard,
  Home,
  TrendingUp,
  Calendar,
  Camera,
  FolderOpen,
  Settings as SettingsIcon,
  ArrowLeft,
  FilePlus2,
  Receipt,
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
import TaxExport from "./components/TaxExport";

import InstallButton from "./components/InstallButton.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const isHome = currentPage === "home";

  const navigate = (page) => setCurrentPage(page);
  const goHome = () => setCurrentPage("home");

  // =========================
  // DASHBOARD TILES
  // =========================

  const tiles = [
    {
      id: "uebersicht",
      label: "Übersicht",
      icon: LayoutDashboard,
      desc: "KPIs & Überblick",
    },
    {
      id: "houses",
      label: "Häuser",
      icon: Home,
      desc: "Objekte verwalten",
    },
    {
      id: "cashflow",
      label: "Cashflow",
      icon: TrendingUp,
      desc: "Einnahmen & Ausgaben",
    },
    {
      id: "abrechnung",
      label: "PDF Generator",
      icon: FilePlus2,
      desc: "Verträge erstellen",
    },
    {
      id: "steuerexport",
      label: "Steuer & Export",
      icon: Receipt,
      desc: "CSV & Steuerberater",
    },
    {
      id: "documents",
      label: "Dokumente",
      icon: Camera,
      desc: "Scans & Fotos",
    },
    {
      id: "appointments",
      label: "Termine",
      icon: Calendar,
      desc: "Besichtigungen",
    },
    {
      id: "documentsmanager",
      label: "Manager",
      icon: FolderOpen,
      desc: "Dateiverwaltung",
    },
    {
      id: "einstellungen",
      label: "Settings",
      icon: SettingsIcon,
      desc: "Konfiguration",
    },
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
                    <Icon size={22} />
                  </div>

                  <div style={textWrap}>
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
      {currentPage === "steuerexport" && <TaxExport />}
      {currentPage === "documents" && <Documents />}
      {currentPage === "documentsmanager" && <DocumentsManager />}
      {currentPage === "einstellungen" && <SettingsPage />}

      <InstallButton />
    </div>
  );
}

/* =========================
   STYLE SYSTEM
========================= */

const page = {
  minHeight: "100vh",
  padding: 20,
  background: "#f6f7fb",
  fontFamily: "Inter, Arial",
  color: "#0f172a",
  paddingTop: "max(20px, env(safe-area-inset-top))",
  paddingBottom: "max(20px, env(safe-area-inset-bottom))",
};

const container = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
};

const header = {
  marginBottom: 28,
  textAlign: "center",
};

const title = {
  fontSize: 48,
  fontWeight: 900,
  marginBottom: 6,
  letterSpacing: "-1px",
  color: "#020617",
};

const subtitle = {
  fontSize: 18,
  color: "#64748b",
  fontWeight: 500,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 360px))",
  justifyContent: "center",
  gap: 18,
};

const card = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  width: "100%",
  minHeight: 140,
  padding: 22,
  borderRadius: 24,
  background: "white",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  cursor: "pointer",
};

const iconBox = {
  width: 56,
  height: 56,
  borderRadius: 18,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const textWrap = { flex: 1 };

const label = {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 4,
};

const desc = {
  fontSize: 16,
  color: "#64748b",
};

const backBtn = {
  position: "fixed",
  top: "max(18px, env(safe-area-inset-top))",
  left: 18,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 999,
  background: "white",
  border: "1px solid #e2e8f0",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};