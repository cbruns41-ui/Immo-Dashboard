export default function Skeleton({ width = "100%", height = 20, variant = "default" }) {
  const baseStyle = {
    background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: variant === "circular" ? "50%" : variant === "rounded" ? 12 : 8
  };

  const styles = {
    default: { ...baseStyle, width, height },
    circular: { ...baseStyle, width: height, height },
    rounded: { ...baseStyle, width, height },
    text: { ...baseStyle, width, height: 16, marginBottom: 8 },
    card: { ...baseStyle, width: "100%", height: 120, borderRadius: 16 },
    button: { ...baseStyle, width: 120, height: 40, borderRadius: 12 }
  };

  return <div style={styles[variant] || styles.default} />;
}

// Add keyframes for shimmer animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(style);
