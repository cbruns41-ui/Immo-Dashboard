/** Nächster Mietzahlungstermin: 1. des aktuellen oder nächsten Monats */
export function getNextRentDueDate(reference = new Date()) {
  const now = new Date(reference);
  now.setHours(0, 0, 0, 0);

  let due = new Date(now.getFullYear(), now.getMonth(), 1);
  if (due < now) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  return due;
}

export function formatRentDueDate(date) {
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildRentReminders(houses) {
  const dueDate = getNextRentDueDate();

  return (houses || [])
    .flatMap((house) =>
      (house.apartments || [])
        .filter((apt) => apt.tenant && Number(apt.warmmiete) > 0)
        .map((apt) => ({
          id: `${house.id}-${apt.id}`,
          tenant: apt.tenant,
          apartmentName: apt.name,
          houseName: house.name,
          amount: Number(apt.warmmiete),
          dueDate,
          dueLabel: formatRentDueDate(dueDate),
        }))
    )
    .sort((a, b) => a.tenant.localeCompare(b.tenant, "de"));
}
