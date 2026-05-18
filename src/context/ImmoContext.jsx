import { createContext, useContext, useState, useEffect } from "react";
import { dataService } from "../services/dataService";
import { supabase } from "../supabase/supabaseClient";

const ImmoContext = createContext();

export function ImmoProvider({ children }) {
  const [user, setUser] = useState(null);
  const [houses, setHouses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vermieter, setVermieter] = useState({
    name: "",
    adresse: "",
    plz: "",
    ort: "",
    telefon: "",
    email: "",
    iban: "",
    bic: "",
    bankname: ""
  });
  const [loading, setLoading] = useState(true);

  // =========================
  // AUTH
  // =========================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUser(session?.user ?? null)
    );

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (!user) {
      setHouses([]);
      setAppointments([]);
      setTransactions([]);
      setVermieter({
        name: "",
        adresse: "",
        plz: "",
        ort: "",
        telefon: "",
        email: "",
        iban: "",
        bic: "",
        bankname: ""
      });
      setLoading(false);
      return;
    }

    const loadAllData = async () => {
      console.log("🚀 Lade Daten für User:", user.id);

      setLoading(true);

      try {
        const v = await dataService.getVermieter(user.id);

        if (v) {
          setVermieter(v);
        }

        const h = await dataService.getHouses(user.id);

        // 🔥 FIX: Alte Datensätze absichern
        const normalizedHouses = (h || []).map(house => ({
          ...house,

          // 🔥 DIESE FELDER FEHLTEN OFT NACH RELOAD
          monthlyLoan: Number(house.monthlyLoan) || 0,
          interestRate: Number(house.interestRate) || 0,

          apartments: (house.apartments || []).map(a => ({
            ...a,
            kaltmiete: Number(a.kaltmiete) || 0,
            warmmiete: Number(a.warmmiete) || 0,
            deposit: Number(a.deposit) || 0,
          }))
        }));

        setHouses(normalizedHouses);

        const a = await dataService.getAppointments(user.id);

        setAppointments(a || []);

        const t = await dataService.getTransactions(user.id);

        setTransactions(t || []);
      } catch (err) {
        console.error("❌ Fehler beim Laden:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user]);

  // =========================
  // SAFE HELPERS (WICHTIG FIX)
  // =========================

  const normalizeId = (id) => {
    if (!id) return "";
    return String(id);
  };

  // =========================
  // SAVE HOOKS
  // =========================
  const saveHousesToDB = async (newHouses) => {
    const safe = Array.isArray(newHouses) ? newHouses : [];

    // 🔥 FIX: Komplette Daten erzwingen
    const normalized = safe.map(h => ({
      ...h,

      id: normalizeId(h.id),

      // 🔥 HIER LAG DER WICHTIGE FIX
      monthlyLoan: Number(h.monthlyLoan) || 0,
      interestRate: Number(h.interestRate) || 0,

      apartments: (h.apartments || []).map(a => ({
        ...a,
        id: normalizeId(a.id),

        kaltmiete: Number(a.kaltmiete) || 0,
        warmmiete: Number(a.warmmiete) || 0,
        deposit: Number(a.deposit) || 0,
      }))
    }));

    // 🔥 DEBUG
    console.log("💾 SPEICHERE HÄUSER:", normalized);

    setHouses(normalized);

    if (user?.id) {
      await dataService.saveHouses(user.id, normalized);
    }
  };

  const saveAppointmentsToDB = async (newAppointments) => {
    const safe = Array.isArray(newAppointments) ? newAppointments : [];

    const normalized = safe.map(a => ({
      ...a,
      id: normalizeId(a.id),
      house_id: normalizeId(a.house_id),
      apartment_id: normalizeId(a.apartment_id),
    }));

    setAppointments(normalized);

    if (user?.id) {
      await dataService.saveAppointments(user.id, normalized);
    }
  };

  const saveTransactionsToDB = async (newTransactions) => {
    const safe = Array.isArray(newTransactions) ? newTransactions : [];

    const normalized = safe.map(t => ({
      ...t,
      id: normalizeId(t.id),
      house_id: normalizeId(t.house_id),
      apartment_id: normalizeId(t.apartment_id),
    }));

    setTransactions(normalized);

    if (user?.id) {
      await dataService.saveTransactions(user.id, normalized);
    }
  };

  const saveVermieterToDB = async (newVermieter) => {
    setVermieter(newVermieter);

    // 🔥 FIX: user.id statt komplettes user Objekt
    if (user?.id) {
      await dataService.saveVermieter(
        user.id,
        newVermieter
      );
    }
  };

  // =========================
  // CONTEXT VALUE
  // =========================
  const value = {
    user,
    houses,
    setHouses: saveHousesToDB,
    appointments,
    setAppointments: saveAppointmentsToDB,
    transactions,
    setTransactions: saveTransactionsToDB,
    vermieter,
    setVermieter: saveVermieterToDB,
    loading,
  };

  return (
    <ImmoContext.Provider value={value}>
      {children}
    </ImmoContext.Provider>
  );
}

export const useImmo = () => useContext(ImmoContext);