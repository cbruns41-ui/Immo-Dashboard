import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Houses from "./components/Houses";
import Appointments from "./components/Appointments";
import Finances from "./components/Finances";
import Abrechnung from "./components/Abrechnung";
import Settings from "./components/Settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#1e40af", marginBottom: 30 }}>🏠 Immo Dashboard</h1>

      <div style={{ textAlign: "center", marginBottom: 35 }}>
        <button onClick={() => setCurrentPage("dashboard")} style={{ margin: "5px", padding: "12px 20px" }}>📊 Dashboard</button>
        <button onClick={() => setCurrentPage("houses")} style={{ margin: "5px", padding: "12px 20px" }}>🏠 Häuser</button>
        <button onClick={() => setCurrentPage("appointments")} style={{ margin: "5px", padding: "12px 20px" }}>📅 Termine</button>
        <button onClick={() => setCurrentPage("finanzen")} style={{ margin: "5px", padding: "12px 20px" }}>💰 Finanzen</button>
        <button onClick={() => setCurrentPage("abrechnung")} style={{ margin: "5px", padding: "12px 20px" }}>📋 Abrechnung</button>
        <button onClick={() => setCurrentPage("einstellungen")} style={{ margin: "5px", padding: "12px 20px" }}>⚙️ Einstellungen</button>
      </div>

      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "houses" && <Houses />}
      {currentPage === "appointments" && <Appointments />}
      {currentPage === "finanzen" && <Finances />}
      {currentPage === "abrechnung" && <Abrechnung />}
      {currentPage === "einstellungen" && <Settings />}
    </div>
  );
}