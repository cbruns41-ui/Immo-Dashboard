/**
 * Prüft, ob der eingeloggte Nutzer der App-Admin ist.
 * Trage deine E-Mail in .env ein: VITE_ADMIN_EMAIL=deine@email.de
 */
export function isAppAdmin(user) {
  if (!user?.email) return false;

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return false;

  return user.email.toLowerCase() === adminEmail;
}
