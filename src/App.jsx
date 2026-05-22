import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  Calendar,
  TrendingUp,
  Camera,
  FolderOpen,
  FileText,
  Receipt,
  Settings as SettingsIcon,
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
  // 🚀 Dashboard direkt als Startseite
  const [currentPage, setCurrentPage] = useState("dashboard");

  const navigate = (page) => {
    setCurrentPage(page);

    // Optional: sanft nach oben scrollen
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 📱 Moderne Scrollbare Bottom Navigation
  const navItems = [
    {
      id: "dashboard",
      label: "Übersicht",
      icon: LayoutDashboard,
    },
    {
      id: "houses",
      label: "Häuser",
      icon: Home,
    },
    {
      id: "cashflow",
      label: "Cashflow",
      icon: TrendingUp,
    },
    {
      id: "documents",
      label: "Dokumente",
      icon: Camera,
    },
    {
      id: "documentsmanager",
      label: "Manager",
      icon: FolderOpen,
    },
    {
      id: "abrechnung",
      label: "PDF",
      icon: FileText,
    },
    {
      id: "steuerexport",
      label: "Export",
      icon: Receipt,
    },
    {
      id: "appointments",
      label: "Termine",
      icon: Calendar,
    },
    {
      id: "einstellungen",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <div style={page}>
      {/* Seiten */}
      <div style={content}>
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
      </div>

      {/* 🔥 Moderne Bottom Navigation */}
      <div style={bottomNavWrapper}>
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
                <Icon size={20} strokeWidth={2.3} />

                <span style={navLabel}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📲 Install Button */}
      <InstallButton />
    </div>
  );
}

/* =========================
   MODERN APP STYLES
========================= */

const page = {
  minHeight: "100vh",
  background:
    "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)",
  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#0f172a",
};

const content = {
  paddingBottom: 110,
};

/* =========================
   MODERN BOTTOM NAV
========================= */

const bottomNavWrapper = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,

  paddingBottom: "max(10px, env(safe-area-inset-bottom))",

  background: "rgba(255,255,255,0.72)",

  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",

  borderTop: "1px solid rgba(226,232,240,0.7)",

  boxShadow: "0 -10px 35px rgba(15,23,42,0.08)",
};

const bottomNav = {
  display: "flex",
  alignItems: "center",

  gap: 12,

  overflowX: "auto",
  overflowY: "hidden",

  whiteSpace: "nowrap",

  padding: "14px 14px 6px",

  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const navItem = {
  flexShrink: 0,

  border: "none",
  outline: "none",

  background: "transparent",

  display: "flex",
  flexDirection: "column",

  alignItems: "center",
  justifyContent: "center",

  gap: 6,

  minWidth: 74,
  height: 64,

  borderRadius: 20,

  color: "#64748b",

  fontSize: 11,
  fontWeight: 700,

  transition: "all 0.22s ease",

  cursor: "pointer",
};

const activeNavItem = {
  ...navItem,

  background: "rgba(15,23,42,0.06)",

  color: "#0f172a",

  boxShadow: "0 4px 14px rgba(15,23,42,0.08)",

  transform: "translateY(-2px)",
};

const navLabel = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.2,
};