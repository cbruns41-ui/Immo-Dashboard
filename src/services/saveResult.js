export function saveOk() {
  return { ok: true };
}

export function saveFail(error, context) {
  const msg =
    error?.message ||
    (typeof error === "string" ? error : "Unbekannter Fehler");

  let hint = "";
  if (
    msg.includes("appointment_type") ||
    msg.includes("maintenance_interval")
  ) {
    hint =
      " Führe in Supabase die Migration supabase-migrations/appointments_maintenance_interval.sql aus.";
  } else if (
    msg.includes("tenant_phone") ||
    msg.includes("tenant_email")
  ) {
    hint =
      " Führe in Supabase die Migration supabase-migrations/apartments_tenant_contact.sql aus.";
  }

  return { ok: false, message: `${context}: ${msg}${hint}` };
}
