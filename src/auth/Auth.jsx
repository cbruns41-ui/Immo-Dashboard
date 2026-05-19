import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Home } from "lucide-react";

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) alert(error.message);
      else alert("Bestätigungs-Mail wurde gesendet!");
    }
  };

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message);
    else setResetSent(true);
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
    return (
      <div style={page}>
        <div style={card}>
          <div style={iconWrap}>
            <Home size={34} />
          </div>

          <h1 style={title}>ImmoForge</h1>
          <p style={subtitle}>Immobilien Management System</p>

          {!forgotMode && !resetSent && (
            <>
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

              <button onClick={() => setIsLogin(!isLogin)} style={linkBtn}>
                {isLogin
                  ? "Noch kein Account? Registrieren"
                  : "Zurück zum Login"}
              </button>

              <button onClick={() => setForgotMode(true)} style={linkBtn}>
                Passwort vergessen
              </button>
            </>
          )}

          {forgotMode && !resetSent && (
            <>
              <p style={text}>
                Passwort Reset Link wird an deine E-Mail gesendet
              </p>

              <button onClick={handleResetPassword} style={primaryBtn}>
                Reset Link senden
              </button>

              <button onClick={() => setForgotMode(false)} style={linkBtn}>
                Zurück
              </button>
            </>
          )}

          {resetSent && (
            <>
              <p style={success}>Reset Link gesendet ✔</p>

              <button
                onClick={() => {
                  setForgotMode(false);
                  setResetSent(false);
                }}
                style={primaryBtn}
              >
                Zurück zum Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* =========================
     APP WRAPPER
  ========================= */
  return (
    <>
      <button onClick={logout} style={logoutBtn}>
        Logout
      </button>
      {children}
    </>
  );
}

/* =========================
   STYLES (IMPROVED UI)
========================= */

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f6f7fb",
  color: "#64748b",
  fontSize: 14,
};

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f6f7fb",
  padding: 20,
  fontFamily: "Inter, Arial",
};

const card = {
  width: "100%",
  maxWidth: 420,
  background: "white",
  borderRadius: 18,
  padding: 28,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  textAlign: "center",
  boxSizing: "border-box",
};

const iconWrap = {
  width: 64,
  height: 64,
  margin: "0 auto 12px",
  borderRadius: 16,
  background: "#0f172a",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const title = {
  fontSize: 26,
  fontWeight: 800,
  marginBottom: 4,
  color: "#0f172a",
};

const subtitle = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 18,
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 10,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 6,
};

const linkBtn = {
  width: "100%",
  marginTop: 8,
  background: "none",
  border: "none",
  color: "#475569",
  fontSize: 13,
  cursor: "pointer",
};

const text = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 10,
};

const success = {
  fontSize: 14,
  color: "#16a34a",
  fontWeight: 600,
};

const logoutBtn = {
  position: "fixed",
  top: 18,
  right: 18,
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontSize: 12,
};