import { useEffect, useState } from "react";
import { isAppAdmin } from "../config/admin";
import { dataService } from "../services/dataService";

/**
 * Admin = VITE_ADMIN_EMAIL in .env ODER Eintrag in Supabase site_admins
 */
export function useAppAdmin(user) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!user?.email) {
        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      if (isAppAdmin(user)) {
        if (mounted) {
          setIsAdmin(true);
          setChecking(false);
        }
        return;
      }

      try {
        const fromDb = await dataService.checkIsSiteAdmin(user.email);
        if (mounted) setIsAdmin(fromDb);
      } catch {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    setChecking(true);
    run();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  return { isAdmin, checking };
}
