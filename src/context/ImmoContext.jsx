import { createContext, useContext, useState, useEffect, useRef } from "react";
import { dataService } from "../services/dataService";
import { supabase } from "../supabase/supabaseClient";
import { demoHouses, demoVermieter, demoTransactions, demoAppointments } from "../data/demoData";
import { useNotifications } from "./NotificationContext";

const ImmoContext = createContext();

const normalizeApartment = (a) => ({
  ...a,
  kaltmiete: Number(a.kaltmiete) || 0,
  warmmiete: Number(a.warmmiete) || 0,
  deposit: Number(a.deposit) || 0,
  tenant_phone: a.tenant_phone?.trim() || "",
  tenant_email: a.tenant_email?.trim() || "",
});

const normalizeHouse = (house, normalizeId) => ({
  ...house,
  id: normalizeId(house.id),
  monthlyLoan: Number(house.monthlyLoan) || 0,
  interestRate: Number(house.interestRate) || 0,
  apartments: (house.apartments || []).map((a) => ({
    ...normalizeApartment(a),
    id: normalizeId(a.id),
  })),
});

export function ImmoProvider({ children, isDemo = false }) {
  const { error: notifyError, success: notifySuccess } = useNotifications();

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
    bankname: "",
    kontoinhaber: "",
    kontonummer: "",
    blz: "",
  });
  const [loading, setLoading] = useState(true);

  const housesRef = useRef(houses);
  const appointmentsRef = useRef(appointments);
  const transactionsRef = useRef(transactions);
  const vermieterRef = useRef(vermieter);

  useEffect(() => {
    housesRef.current = houses;
  }, [houses]);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);
  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);
  useEffect(() => {
    vermieterRef.current = vermieter;
  }, [vermieter]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUser(session?.user ?? null)
    );

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (isDemo) return;
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) {
      setHouses(demoHouses);
      setAppointments(demoAppointments);
      setTransactions(demoTransactions);
      setVermieter(demoVermieter);
      setUser({ id: "demo-user", email: "demo@example.com" });
      setLoading(false);
      return;
    }

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
        bankname: "",
        kontoinhaber: "",
        kontonummer: "",
        blz: "",
      });
      setLoading(false);
      return;
    }

    const loadAllData = async () => {
      setLoading(true);

      try {
        const v = await dataService.getVermieter(user.id);
        if (v) setVermieter(v);

        const h = await dataService.getHouses(user.id);
        const normalizedHouses = (h || []).map((house) =>
          normalizeHouse(house, (id) => String(id || ""))
        );
        setHouses(normalizedHouses);

        const a = await dataService.getAppointments(user.id);
        setAppointments(a || []);

        const t = await dataService.getTransactions(user.id);
        setTransactions(t || []);
      } catch (err) {
        notifyError("Daten konnten nicht geladen werden.");
        console.error("Fehler beim Laden:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user, isDemo, notifyError]);

  const normalizeId = (id) => {
    if (!id) return "";
    return String(id);
  };

  const saveHousesToDB = async (newHouses) => {
    const safe = Array.isArray(newHouses) ? newHouses : [];
    const normalized = safe.map((h) => normalizeHouse(h, normalizeId));
    const previous = [...housesRef.current];

    const targetState = normalized;
    setHouses(targetState);

    if (user?.id && !isDemo) {
      const result = await dataService.saveHouses(user.id, targetState);
      if (!result.ok) {
        setHouses(previous);
        notifyError(result.message);
        return false;
      }
    }
    return true;
  };

  const saveAppointmentsToDB = async (newAppointments) => {
    const safe = Array.isArray(newAppointments) ? newAppointments : [];
    const normalized = safe.map((a) => ({
      ...a,
      id: normalizeId(a.id),
      house_id: normalizeId(a.house_id),
      apartment_id: normalizeId(a.apartment_id),
      appointment_type: a.appointment_type || "other",
      maintenance_interval_months: a.maintenance_interval_months
        ? Number(a.maintenance_interval_months)
        : null,
    }));
    const previous = [...appointmentsRef.current];

    setAppointments(normalized);

    if (user?.id && !isDemo) {
      const result = await dataService.saveAppointments(user.id, normalized);
      if (!result.ok) {
        setAppointments(previous);
        notifyError(result.message);
        return false;
      }
    }
    return true;
  };

  const saveTransactionsToDB = async (newTransactions) => {
    const safe = Array.isArray(newTransactions) ? newTransactions : [];
    const normalized = safe.map((t) => ({
      ...t,
      id: normalizeId(t.id),
      house_id: normalizeId(t.house_id),
      apartment_id: normalizeId(t.apartment_id),
    }));
    const previous = [...transactionsRef.current];

    setTransactions(normalized);

    if (user?.id && !isDemo) {
      const result = await dataService.saveTransactions(user.id, normalized);
      if (!result.ok) {
        setTransactions(previous);
        notifyError(result.message);
        return false;
      }
    }
    return true;
  };

  const updateVermieter = (newVermieter) => {
    setVermieter(newVermieter);
  };

  const saveVermieterToDB = async (data = vermieterRef.current) => {
    const previous = { ...vermieterRef.current };
    setVermieter(data);

    if (user?.id && !isDemo) {
      const result = await dataService.saveVermieter(user.id, data);
      if (!result.ok) {
        setVermieter(previous);
        notifyError(result.message);
        return false;
      }
    }
    return true;
  };

  const value = {
    user,
    houses,
    setHouses: saveHousesToDB,
    appointments,
    setAppointments: saveAppointmentsToDB,
    transactions,
    setTransactions: saveTransactionsToDB,
    vermieter,
    setVermieter: updateVermieter,
    saveVermieter: saveVermieterToDB,
    loading,
    isDemo,
  };

  return (
    <ImmoContext.Provider value={value}>
      {children}
    </ImmoContext.Provider>
  );
}

export const useImmo = () => useContext(ImmoContext);
