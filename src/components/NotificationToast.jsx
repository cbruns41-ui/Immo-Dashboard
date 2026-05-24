import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
  };

  const colors = {
    success: { bg: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)", border: "#86efac", text: "#166534" },
    error: { bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5", text: "#dc2626" },
    info: { bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", border: "#93c5fd", text: "#2563eb" },
    warning: { bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d", text: "#d97706" }
  };

  return (
    <div style={container}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            ...toast,
            background: colors[notification.type]?.bg || colors.info.bg,
            borderColor: colors[notification.type]?.border || colors.info.border
          }}
        >
          <div style={{ ...iconWrapper, color: colors[notification.type]?.text || colors.info.text }}>
            {icons[notification.type] || icons.info}
          </div>
          <span style={{ ...message, color: colors[notification.type]?.text || colors.info.text }}>
            {notification.message}
          </span>
          <button
            onClick={() => removeNotification(notification.id)}
            style={closeBtn}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

const container = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 10000,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: 400
};

const toast = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 16,
  borderRadius: 16,
  border: "2px solid",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  animation: "slideIn 0.3s ease"
};

const iconWrapper = {
  flexShrink: 0
};

const message = {
  flex: 1,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.4
};

const closeBtn = {
  flexShrink: 0,
  padding: 4,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  opacity: 0.6,
  transition: "opacity 0.2s ease"
};

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
