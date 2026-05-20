import { useState } from "react";

import Dashboard from "../components/Dashboard";
import Houses from "../components/Houses";
import Cashflow from "../components/Cashflow";
import TaxExport from "../components/TaxExport";
import Documents from "../components/Documents";
import DocumentsManager from "../components/DocumentsManager";
import SettingsPage from "../components/Settings";

export default function AppHome({ user, logout }) {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      {/* TOP BAR */}
      <div style={topbar}>
        <div>👋 {user?.name}</div>

        <div>
          <button onClick={logout} style={logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* NAV */}
      <div style={nav}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("houses")}>Häuser</button>
        <button onClick={() => setPage("cashflow")}>Cashflow</button>
        <button onClick={() => setPage("tax")}>Steuer</button>
        <button onClick={() => setPage("docs")}>Dokumente</button>
        <button onClick={() => setPage("manager")}>Manager</button>
        <button onClick={() => setPage("settings")}>Settings</button>
      </div>

      {/* CONTENT */}
      {page === "dashboard" && <Dashboard />}
      {page === "houses" && <Houses />}
      {page === "cashflow" && <Cashflow />}
      {page === "tax" && <TaxExport />}
      {page === "docs" && <Documents />}
      {page === "manager" && <DocumentsManager />}
      {page === "settings" && <SettingsPage />}
    </div>
  );
}

const topbar = {
  display: "flex",
  justifyContent: "space-between",
  padding: 16,
  background: "white",
  borderBottom: "1px solid #e2e8f0",
};

const nav = {
  display: "flex",
  gap: 10,
  padding: 10,
  background: "#f8fafc",
};

const logoutBtn = {
  padding: "6px 12px",
  border: "1px solid #e2e8f0",
  background: "white",
  borderRadius: 8,
  cursor: "pointer",
};