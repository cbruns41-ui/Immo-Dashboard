import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Home } from "lucide-react";
import AppHome from "../pages/AppHome";
import { useNotifications } from "../context/NotificationContext";

export default function Auth({ children }) {
  const { error: notifyError, success: notifySuccess, info: notifyInfo } =
    useNotifications();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [loginMode, setLoginMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) notifyError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) notifyError(error.message);
      else notifySuccess("Bestätigungs-Mail wurde gesendet!");
    }
  };

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) notifyError(error.message);
    else {
      setResetSent(true);
      notifyInfo("Link zum Zurücksetzen wurde per E-Mail gesendet.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsDemo(false);
    setLoginMode(false);
    setForgotMode(false);
    setResetSent(false);
  };

  const startDemo = () => {
    setIsDemo(true);
    setUser({ id: "demo-user", email: "demo@example.com" });
  };

  const showLoginForm = () => {
    // Zeige Login-Formular statt Landing
    setLoginMode(true);
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return <div style={loadingStyle}>App wird geladen...</div>;
  }

  /* =========================
     LOGIN SCREEN
  ========================= */
  if (!user) {
    if (loginMode) {
      // Zeige Login-Formular
      return (
        <div style={page}>
          <div style={card}>
            <div style={iconWrap}>
              <Home size={32} />
            </div>
            <h2 style={title}>Willkommen zurück</h2>
            <p style={subtitle}>Melde dich an, um fortzufahren</p>

            <input
              style={input}
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={input}
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleAuth} style={primaryBtn}>
              {isLogin ? "Einloggen" : "Registrieren"}
            </button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              style={linkBtn}
            >
              {isLogin ? "Noch kein Account? Registrieren" : "Bereits einen Account? Einloggen"}
            </button>

            <button
              onClick={() => setLoginMode(false)}
              style={linkBtn}
            >
              ← Zurück
            </button>
          </div>
        </div>
      );
    }

    return (
      <AppHome
        onLogin={() => setLoginMode(true)}
        onDemo={startDemo}
      />
    );
  }

  /* =========================
     APP WRAPPER
  ========================= */
  // Support render prop pattern
  if (typeof children === 'function') {
    return children({ isDemo, onDemo: startDemo, logout });
  }
  
  if (React.isValidElement(children)) {
    return (
      <>
        <button onClick={logout} style={logoutBtn}>
          Logout
        </button>
        {React.cloneElement(children, { isDemo, onDemo: startDemo })}
      </>
    );
  }
  
  return (
    <>
      <button onClick={logout} style={logoutBtn}>
        Logout
      </button>
      {children}
    </>
  );
}

Auth.displayName = "Auth";

/* =========================
   LOADING STYLE
========================= */

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontSize: 16,
  fontWeight: 600
};

/* =========================
   PAGE WRAPPER (FIX MOBILE)
========================= */

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  padding: 20,

  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",

  /* wichtig für iOS safe area */
  paddingTop: "max(20px, env(safe-area-inset-top))",
  paddingBottom: "max(20px, env(safe-area-inset-bottom))",
  boxSizing: "border-box"
};

/* =========================
   LOGIN CARD (FIXED MOBILE)
========================= */

const card = {
  width: "100%",
  maxWidth: 380,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 24,
  padding: 32,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
  textAlign: "center",
  boxSizing: "border-box"
};

/* =========================
   ICON
========================= */

const iconWrap = {
  width: 64,
  height: 64,
  margin: "0 auto 16px",
  borderRadius: 18,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
};

/* =========================
   TEXT
========================= */

const title = {
  fontSize: 28,
  fontWeight: 800,
  marginBottom: 6,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  fontSize: 15,
  color: "#64748b",
  marginBottom: 24,
  fontWeight: 500
};

const text = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 12,
  fontWeight: 500
};

const success = {
  fontSize: 15,
  color: "#16a34a",
  fontWeight: 700,
  marginBottom: 16
};

/* =========================
   INPUTS (FIX MOBILE OVERFLOW)
========================= */

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  borderRadius: 14,
  border: "2px solid #e2e8f0",
  fontSize: 15,
  fontWeight: 500,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  transition: "all 0.2s ease"
};

/* =========================
   BUTTONS
========================= */

const primaryBtn = {
  width: "100%",
  padding: 16,
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 8,
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};

const linkBtn = {
  width: "100%",
  marginTop: 12,
  background: "none",
  border: "none",
  color: "#3b82f6",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease"
};

/* =========================
   LOGOUT
========================= */

const logoutBtn = {
  position: "fixed",
  top: 18,
  right: 18,
  padding: "10px 16px",
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  color: "#0f172a",
  zIndex: 9999,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
};