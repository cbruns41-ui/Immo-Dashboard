export const APPOINTMENT_TYPES = [
  { value: "maintenance", label: "Wartung" },
  { value: "viewing", label: "Besichtigung" },
  { value: "other", label: "Sonstiges" },
];

export const MAINTENANCE_INTERVAL_OPTIONS = [
  { value: "", label: "Kein Intervall (einmalig)" },
  { value: "3", label: "Alle 3 Monate" },
  { value: "6", label: "Alle 6 Monate" },
  { value: "12", label: "Jährlich (12 Monate)" },
  { value: "24", label: "Alle 2 Jahre" },
  { value: "36", label: "Alle 3 Jahre" },
];

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function getNextMaintenanceDate(lastDate, intervalMonths) {
  const months = Number(intervalMonths);
  if (!lastDate || !months || months <= 0) return null;

  let d = new Date(lastDate);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (d <= today) {
    d = addMonths(d, months);
  }

  return d.toISOString().split("T")[0];
}

export function formatIntervalLabel(months) {
  const m = Number(months);
  if (!m || m <= 0) return null;
  if (m === 12) return "Jährlich";
  if (m === 24) return "Alle 2 Jahre";
  if (m === 36) return "Alle 3 Jahre";
  return `Alle ${m} Monate`;
}

export function isMaintenanceAppointment(appointment) {
  return appointment?.appointment_type === "maintenance";
}

export function getAppointmentLabel(appointment) {
  return (
    appointment?.description ||
    appointment?.title ||
    "Ohne Beschreibung"
  );
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}
