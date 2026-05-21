import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { ImmoProvider } from "./context/ImmoContext.jsx";

import Auth from "./auth/Auth.jsx";

import App from "./App.jsx";

import Landing from "./pages/Landing.jsx";

function RootApp() {
  const [showLogin, setShowLogin] =
    useState(false);

  return (
    <>
      {!showLogin ? (
        <Landing
          onLogin={() => setShowLogin(true)}
        />
      ) : (
        <ImmoProvider>
          <Auth>
            <App />
          </Auth>
        </ImmoProvider>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);