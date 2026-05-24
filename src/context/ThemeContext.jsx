import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Update document class for global styles
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? darkColors : lightColors
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  card: "rgba(255, 255, 255, 0.95)",
  text: "#0f172a",
  textSecondary: "#64748b",
  border: "rgba(226, 232, 240, 0.5)",
  gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  shadow: "rgba(0, 0, 0, 0.1)"
};

const darkColors = {
  background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  card: "rgba(30, 41, 59, 0.95)",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  border: "rgba(71, 85, 105, 0.5)",
  gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  shadow: "rgba(0, 0, 0, 0.3)"
};
