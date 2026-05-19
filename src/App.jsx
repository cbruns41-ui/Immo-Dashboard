import { useState } from "react";

import Dashboard from "./components/Dashboard";
import Houses from "./components/Houses";
import Appointments from "./components/Appointments";
import Finances from "./components/Finances";
import Abrechnung from "./components/Abrechnung";
import Settings from "./components/Settings";
import Cashflow from "./components/Cashflow.jsx";
import Documents from "./components/Documents";
import DocumentsManager from "./components/DocumentsManager";

import InstallButton from "./components/InstallButton.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const isHome = currentPage === "home";

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>

      {/* Zurück-Button (erscheint auf allen Seiten außer der Startseite) */}
      {!isHome && (
        <button
          onClick={() => setCurrentPage("home")}
          style={{
            position: "fixed",
            top: "25px",
            left: "25px",
            zIndex: 1000,
            background: "white",
            border: "none",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          }}
        >
          ←
        </button>
      )}

      {/* STARTSEITE – große vertikale Kacheln */}
      {isHome && (
        <>
          <h1 style={{
            textAlign: "center",
            color: "#0A2540",
            marginBottom: 30,
            fontSize: "28px",
            fontWeight: "700",
          }}>
            🏠 ImmoForge
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <button onClick={() => setCurrentPage("uebersicht")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>📊</span>
              <div>Übersicht</div>
            </button>

            <button onClick={() => setCurrentPage("houses")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>🏠</span>
              <div>Häuser & Wohnungen</div>
            </button>

            <button onClick={() => setCurrentPage("cashflow")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>📈</span>
              <div>Cashflow</div>
            </button>

            <button onClick={() => setCurrentPage("abrechnung")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>📋</span>
              <div>Abrechnung</div>
            </button>

            <button onClick={() => setCurrentPage("appointments")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>📅</span>
              <div>Termine</div>
            </button>

            <button onClick={() => setCurrentPage("documents")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>📸</span>
              <div>Dokumente Fotografieren</div>
            </button>

            <button onClick={() => setCurrentPage("documentsmanager")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>📁</span>
              <div>Dokument Manager</div>
            </button>

            <button onClick={() => setCurrentPage("einstellungen")} style={tileStyle}>
              <span style={{ fontSize: "32px" }}>⚙️</span>
              <div>Einstellungen</div>
            </button>
          </div>
        </>
      )}

      {/* Die restlichen Seiten */}
      {currentPage === "uebersicht" && <Dashboard />}
      {currentPage === "houses" && <Houses />}
      {currentPage === "appointments" && <Appointments />}
      {currentPage === "finanzen" && <Finances />}
      {currentPage === "cashflow" && <Cashflow />}
      {currentPage === "abrechnung" && <Abrechnung />}
      {currentPage === "documents" && <Documents />}
      {currentPage === "documentsmanager" && <DocumentsManager />}
      {currentPage === "einstellungen" && <Settings />}

      <InstallButton />
    </div>
  );
}

// Stil für die großen Kacheln
const tileStyle = {
  background: "white",
  padding: "24px 20px",
  borderRadius: "20px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  border: "none",
  textAlign: "left",
  fontSize: "20px",
  fontWeight: "600",
  color: "#0A2540",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  width: "100%"
};