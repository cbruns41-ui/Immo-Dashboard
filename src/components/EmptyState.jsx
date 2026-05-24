import { Home, FileText, Calendar, Building2, Plus } from "lucide-react";

export default function EmptyState({ type = "default", actionText, onAction }) {
  const configs = {
    houses: {
      icon: <Home size={64} />,
      title: "Noch keine Häuser",
      description: "Füge dein erstes Haus hinzu, um mit der Verwaltung zu beginnen",
      actionText: actionText || "Haus hinzufügen"
    },
    apartments: {
      icon: <Building2 size={64} />,
      title: "Keine Wohnungen",
      description: "Füge Wohnungen zu diesem Haus hinzu",
      actionText: actionText || "Wohnung hinzufügen"
    },
    documents: {
      icon: <FileText size={64} />,
      title: "Keine Dokumente",
      description: "Lade deine ersten Dokumente hoch",
      actionText: actionText || "Dokument hochladen"
    },
    appointments: {
      icon: <Calendar size={64} />,
      title: "Keine Termine",
      description: "Plane deine ersten Termine",
      actionText: actionText || "Termin hinzufügen"
    },
    default: {
      icon: <Plus size={64} />,
      title: "Keine Daten",
      description: "Füge deine ersten Daten hinzu",
      actionText: actionText || "Hinzufügen"
    }
  };

  const config = configs[type] || configs.default;

  return (
    <div style={container}>
      <div style={iconWrapper}>{config.icon}</div>
      <h3 style={title}>{config.title}</h3>
      <p style={description}>{config.description}</p>
      {onAction && (
        <button onClick={onAction} style={button}>
          {config.actionText}
        </button>
      )}
    </div>
  );
}

const container = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 60,
  textAlign: "center"
};

const iconWrapper = {
  width: 120,
  height: 120,
  borderRadius: 24,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  marginBottom: 24,
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)"
};

const title = {
  fontSize: 24,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 12
};

const description = {
  fontSize: 16,
  color: "#64748b",
  marginBottom: 24,
  maxWidth: 400,
  lineHeight: 1.5
};

const button = {
  padding: "14px 28px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease"
};
