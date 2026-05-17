import { useState } from "react";

import Dashboard from "./components/Dashboard";
import Houses from "./components/Houses";
import Appointments from "./components/Appointments";
import Finances from "./components/Finances";
import Abrechnung from "./components/Abrechnung";
import Settings from "./components/Settings";
import Cashflow from "./components/Cashflow.jsx";

import InstallButton from "./components/InstallButton.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "houses", label: "Häuser", icon: "🏠" },
    { id: "appointments", label: "Termine", icon: "📅" },
    { id: "finanzen", label: "Finanzen", icon: "💰" },
    { id: "cashflow", label: "Cashflow", icon: "📈" },
    { id: "abrechnung", label: "Abrechnung", icon: "📋" },
    { id: "einstellungen", label: "Einstellungen", icon: "⚙️" },
  ];

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <h1
        style={{
          textAlign: "center",
          color: "#0A2540",
          marginBottom: 30,
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        🏠 Immo Dashboard
      </h1>

      {/* Moderne Navigation */}
      <div
        style={{
          background: "white",
          padding: "12px 16px",
          borderRadius: "16px",
          boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
          marginBottom: 35,
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              padding: "14px 22px",
              borderRadius: "14px",
              border: "none",
              background: currentPage === item.id ? "#0A2540" : "#f1f5f9",
              color: currentPage === item.id ? "white" : "#334155",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.25s ease",
              boxShadow: currentPage === item.id ? "0 4px 15px rgba(10, 37, 64, 0.25)" : "none",
              minWidth: "140px",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "22px" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* PAGES – alles bleibt genau gleich */}
      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "houses" && <Houses />}
      {currentPage === "appointments" && <Appointments />}
      {currentPage === "finanzen" && <Finances />}
      {currentPage === "cashflow" && <Cashflow />}
      {currentPage === "abrechnung" && <Abrechnung />}
      {currentPage === "einstellungen" && <Settings />}

      {/* Install Button */}
      <InstallButton />
    </div>
  );
}