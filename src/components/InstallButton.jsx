import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setVisible(false);
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isIOS) {
    return (
      <div style={{ position: "fixed", bottom: 20, left: 20, right: 20 }}>
        📲 iOS: Teilen → „Zum Home-Bildschirm“
      </div>
    );
  }

  if (!visible) return null;

  return (
    <button
      onClick={installApp}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "12px 18px",
        background: "#1e40af",
        color: "white",
        border: "none",
        borderRadius: 10,
        zIndex: 9999,
      }}
    >
      📲 App installieren
    </button>
  );
}