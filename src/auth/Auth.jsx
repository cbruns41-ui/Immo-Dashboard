import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

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

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error && error.status !== 403) {
      console.warn("Logout error:", error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        App wird geladen...
      </div>
    );
  }

  if (!user) {
    return (
      // ─────────────────────────────────────────────────────────────
      // NEUER FIX: Vollbild-Container, der immer zentriert bleibt
      // ─────────────────────────────────────────────────────────────
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
            padding: "40px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: 10 }}>🔐 Immo Dashboard</h1>
          <p style={{ marginBottom: 25 }}>Bitte melde dich an</p>

          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: 12,
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: 20,
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={handleAuth}
            style={{
              width: "100%",
              padding: "14px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          >
            {isLogin ? "Einloggen" : "Registrieren"}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              marginTop: 15,
              color: "blue",
              background: "none",
              border: "none",
            }}
          >
            {isLogin
              ? "Noch kein Account? Jetzt registrieren"
              : "Zurück zum Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "15px",
          right: "15px",
          zIndex: 9999,
        }}
      >
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