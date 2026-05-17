import { supabase } from "../supabase/supabaseClient";

export const dataService = {
  // =========================
  // VERMieter
  // =========================
  async getVermieter(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("vermieter")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("❌ Vermieter laden:", error);
      return null;
    }

    return data;
  },

  async saveVermieter(userId, dataVermieter) {
    if (!userId) return;

    const { error } = await supabase
      .from("vermieter")
      .upsert({
        user_id: userId,
        ...dataVermieter,
      }, { onConflict: "user_id" });

    if (error) console.error("❌ Vermieter speichern:", error);
  },

  // =========================
  // HOUSES
  // =========================
  async getHouses(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("houses")
      .select("*, apartments(*)")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Houses laden:", error);
      return [];
    }

    return data || [];
  },

  async saveHouses(userId, houses) {
    if (!userId) return;

    const { error } = await supabase.from("houses").upsert(
      houses.map(h => ({
        id: h.id,
        user_id: userId,
        name: h.name,
        costs: h.costs || {},
      }))
    );

    if (error) console.error("❌ Houses speichern:", error);

    const apartments = houses.flatMap(h =>
      (h.apartments || []).map(a => ({
        id: a.id,
        user_id: userId,
        house_id: h.id,
        name: a.name,
        tenant: a.tenant,
        tenant2: a.tenant2,
        persons: a.persons,
        kaltmiete: a.kaltmiete,
        warmmiete: a.warmmiete,
        deposit: a.deposit,
        notes: a.notes,
      }))
    );

    if (apartments.length > 0) {
      const { error: err2 } = await supabase
        .from("apartments")
        .upsert(apartments);

      if (err2) console.error("❌ Apartments speichern:", err2);
    }
  },

  // =========================
  // APPOINTMENTS
  // =========================
  async getAppointments(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Termine laden:", error);
      return [];
    }

    return data || [];
  },

  async saveAppointments(userId, items) {
    if (!userId) return;

    const { error } = await supabase.from("appointments").upsert(
      items.map(a => ({
        id: a.id,
        user_id: userId,
        house_id: a.house_id || null,
        apartment_id: a.apartment_id || null,
        date: a.date,
        title: a.title || "",
        description: a.description || "",
      }))
    );

    if (error) console.error("❌ Termine speichern:", error);
  },

  // =========================
  // TRANSACTIONS
  // =========================
  async getTransactions(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Finanzen laden:", error);
      return [];
    }

    return data || [];
  },

  async saveTransactions(userId, items) {
    if (!userId) return;

    const { error } = await supabase.from("transactions").upsert(
      items.map(t => ({
        id: t.id,
        user_id: userId,
        house_id: t.house_id || null,
        apartment_id: t.apartment_id || null,
        date: t.date,
        amount: t.amount,
        type: t.type,
        description: t.description,
      }))
    );

    if (error) console.error("❌ Finanzen speichern:", error);
  },
};