import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Passwort-Reset Modus
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Bestätigungs-Mail wurde gesendet!");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      alert(error.message);
    } else {
      setResetSent(true);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.status !== 403) {
      console.warn("Logout error:", error.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>App wird geladen...</div>;
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: "20px",
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            padding: "40px 35px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔨</div>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: "700", 
            color: "#0A2540", 
            marginBottom: "6px",
            letterSpacing: "-1px"
          }}>
            ImmoForge
          </h1>
          
          <p style={{ 
            fontSize: "17px", 
            fontWeight: "600", 
            color: "#0A2540", 
            marginBottom: "4px" 
          }}>
            Deine Immobilien. Deine Kontrolle.
          </p>
          
          <p style={{ 
            fontSize: "15px", 
            color: "#64748b", 
            marginBottom: "32px" 
          }}>
            Sichere Vermietung • Übersichtliche Finanzen • Automatische Abrechnungen
          </p>

          {/* Normaler Login / Registrieren */}
          {!forgotMode && !resetSent && (
            <>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginBottom: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "16px",
                }}
              />

              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginBottom: "24px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "16px",
                }}
              />

              <button
                onClick={handleAuth}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(135deg, #0A2540, #00D4C8)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "17px",
                  fontWeight: "600",
                }}
              >
                {isLogin ? "Einloggen" : "Registrieren"}
              </button>

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => setForgotMode(true)}
                  style={{ color: "#0A2540", background: "none", border: "none", fontSize: "15px" }}
                >
                  Passwort vergessen?
                </button>
              </div>

              <button
                onClick={() => setIsLogin(!isLogin)}
                style={{ marginTop: "10px", color: "#0A2540", background: "none", border: "none", fontSize: "15px" }}
              >
                {isLogin ? "Noch kein Account? Jetzt registrieren" : "Zurück zum Login"}
              </button>
            </>
          )}

          {/* Passwort vergessen Formular */}
          {forgotMode && !resetSent && (
            <>
              <h3 style={{ marginBottom: "20px", color: "#0A2540" }}>Passwort zurücksetzen</h3>
              <p style={{ marginBottom: "25px", color: "#64748b", fontSize: "15px" }}>
                Gib deine E-Mail-Adresse ein. Du erhältst einen Link zum Zurücksetzen.
              </p>

              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "16px",
                }}
              />

              <button
                onClick={handleResetPassword}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(135deg, #0A2540, #00D4C8)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "17px",
                  fontWeight: "600",
                }}
              >
                Reset-Link senden
              </button>

              <button
                onClick={() => { setForgotMode(false); setResetSent(false); }}
                style={{ marginTop: "20px", color: "#0A2540", background: "none", border: "none" }}
              >
                ← Zurück zum Login
              </button>
            </>
          )}

          {/* Erfolgsmeldung nach Reset */}
          {resetSent && (
            <>
              <h3 style={{ color: "#0A2540", marginBottom: "15px" }}>✅ Link gesendet!</h3>
              <p style={{ color: "#64748b", marginBottom: "30px" }}>
                Schau in deinem Postfach nach (auch im Spam-Ordner).
              </p>
              <button
                onClick={() => { setForgotMode(false); setResetSent(false); setEmail(""); }}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#0A2540",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                }}
              >
                Zurück zum Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "fixed", top: "15px", right: "15px", zIndex: 9999 }}>
        <button
          onClick={logout}
          style={{
            padding: "8px 18px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Abmelden
        </button>
      </div>

      {children}
    </>
  );
}