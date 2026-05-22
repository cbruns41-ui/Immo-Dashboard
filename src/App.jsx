import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  Calendar,
  TrendingUp,
  Camera,
  FolderOpen,
  ArrowLeft,
  FileText,
  Receipt,
  Settings as SettingsIcon,     // ← Jetzt korrekt importiert
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

  // Bottom Navigation Items
  const navItems = [
    { id: "dashboard", label: "Übersicht", icon: LayoutDashboard },
    { id: "houses", label: "Häuser", icon: Home },
    { id: "appointments", label: "Termine", icon: Calendar },
    { id: "cashflow", label: "Cashflow", icon: TrendingUp },
    { id: "documents", label: "Dokumente", icon: Camera },
  ];

  return (
    <div style={page}>
      {/* Back Button */}
      {!isHome && (
        <button onClick={goHome} style={backBtn}>
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>
      )}

      {/* HOME - Große Kacheln */}
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
                    <Icon size={26} />
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

      {/* Andere Seiten */}
      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "houses" && <Houses />}
      {currentPage === "appointments" && <Appointments />}
      {currentPage === "finanzen" && <Finances />}
      {currentPage === "cashflow" && <Cashflow />}
      {currentPage === "abrechnung" && <Abrechnung />}
      {currentPage === "steuerexport" && <TaxExport />}
      {currentPage === "documents" && <Documents />}
      {currentPage === "documentsmanager" && <DocumentsManager />}
      {currentPage === "einstellungen" && <SettingsPage />}

      {/* BOTTOM NAVIGATION */}
      <div style={bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={isActive ? activeNavItem : navItem}
            >
              <Icon size={24} />
              <span style={navLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <InstallButton />
    </div>
  );
}

/* =========================
   TILES (unverändert)
========================= */
const tiles = [
  { id: "dashboard", label: "Übersicht", icon: LayoutDashboard, desc: "KPIs & Überblick" },
  { id: "houses", label: "Häuser", icon: Home, desc: "Objekte verwalten" },
  { id: "cashflow", label: "Cashflow", icon: TrendingUp, desc: "Einnahmen & Ausgaben" },
  { id: "abrechnung", label: "PDF Generator", icon: FileText, desc: "Verträge erstellen" },
  { id: "steuerexport", label: "Steuer & Export", icon: Receipt, desc: "CSV & Steuerberater" },
  { id: "documents", label: "Dokumente", icon: Camera, desc: "Scans & Fotos" },
  { id: "appointments", label: "Termine", icon: Calendar, desc: "Besichtigungen" },
  { id: "documentsmanager", label: "Dokument Manager", icon: FolderOpen, desc: "Dateiverwaltung" },
  { id: "einstellungen", label: "Einstellungen", icon: SettingsIcon, desc: "Konfiguration" },
];

/* =========================
   SAAS + MOBILE STYLES
========================= */
const page = {
  minHeight: "100vh",
  background: "#f6f7fb",
  fontFamily: "Inter, Arial",
  color: "#0f172a",
  paddingBottom: 80,
};

const container = { maxWidth: 900, margin: "0 auto", padding: "20px 16px" };

const header = { textAlign: "center", marginBottom: 32 };
const title = { fontSize: 42, fontWeight: 900, marginBottom: 6 };
const subtitle = { fontSize: 18, color: "#64748b" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 18,
};

const card = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  padding: 24,
  borderRadius: 24,
  background: "white",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  cursor: "pointer",
};

const iconBox = {
  width: 64,
  height: 64,
  borderRadius: 18,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const textWrap = { flex: 1 };
const label = { fontSize: 21, fontWeight: 800, marginBottom: 4 };
const desc = { fontSize: 15, color: "#64748b" };

const bottomNav = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: 74,
  background: "white",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  boxShadow: "0 -4px 15px rgba(0,0,0,0.1)",
  zIndex: 1000,
};

const navItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#64748b",
  fontSize: 11,
  gap: 4,
};

const activeNavItem = {
  ...navItem,
  color: "#0A2540",
  fontWeight: 700,
};

const navLabel = { fontSize: 11, marginTop: 2 };

const backBtn = {
  position: "fixed",
  top: "max(18px, env(safe-area-inset-top))",
  left: 18,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  borderRadius: 999,
  background: "white",
  border: "1px solid #e2e8f0",
  fontSize: 15,
  fontWeight: 700,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};