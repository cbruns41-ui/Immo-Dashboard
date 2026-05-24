import { supabase } from "../supabase/supabaseClient";
import { saveOk, saveFail } from "./saveResult";

export const dataService = {
  // =========================
  // VERMIETER
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
    if (!userId) return saveOk();

    const { data: existing, error: loadError } =
      await supabase
        .from("vermieter")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

    if (loadError) {
      return saveFail(loadError, "Vermieter laden");
    }

    if (existing) {
      const { error } = await supabase
        .from("vermieter")
        .update({
          ...dataVermieter,
        })
        .eq("user_id", userId);

      return error ? saveFail(error, "Vermieter speichern") : saveOk();
    }

    const { error } = await supabase
      .from("vermieter")
      .insert({
        user_id: userId,
        ...dataVermieter,
      });

    return error ? saveFail(error, "Vermieter speichern") : saveOk();
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
    if (!userId) return saveOk();

    // =========================
    // HOUSE IDS
    // =========================
    const currentHouseIds = houses.map((h) =>
      String(h.id)
    );

    // =========================
    // DB HOUSES LADEN
    // =========================
    const {
      data: dbHouses,
      error: loadHouseError,
    } = await supabase
      .from("houses")
      .select("id")
      .eq("user_id", userId);

    if (loadHouseError) {
      return saveFail(loadHouseError, "Häuser laden");
    }

    const dbHouseIds = (
      dbHouses || []
    ).map((h) => String(h.id));

    // =========================
    // GELÖSCHTE HOUSES
    // =========================
    const deletedHouseIds = dbHouseIds.filter(
      (id) => !currentHouseIds.includes(id)
    );

    // =========================
    // HOUSES LÖSCHEN
    // =========================
    if (deletedHouseIds.length > 0) {
      // Erst Apartments löschen
      const {
        error: deleteApartmentsError,
      } = await supabase
        .from("apartments")
        .delete()
        .in("house_id", deletedHouseIds);

      if (deleteApartmentsError) {
        return saveFail(deleteApartmentsError, "Wohnungen löschen");
      }

      const { error: deleteHouseError } = await supabase
        .from("houses")
        .delete()
        .in("id", deletedHouseIds);

      if (deleteHouseError) {
        return saveFail(deleteHouseError, "Häuser löschen");
      }
    }

    // =========================
    // HOUSES SPEICHERN
    // =========================
    const { error } = await supabase
      .from("houses")
      .upsert(
        houses.map((h) => ({
          id: String(h.id),
          user_id: userId,
          name: h.name,

          // 🔥 FIX FEHLTE HIER
          monthlyLoan:
            Number(h.monthlyLoan) || 0,

          // 🔥 FIX FEHLTE HIER
          interestRate:
            Number(h.interestRate) || 0,

          costs: h.costs || {},
        }))
      );

    if (error) {
      return saveFail(error, "Häuser speichern");
    }

    const apartments = houses.flatMap((h) =>
      (h.apartments || []).map((a) => ({
        id: String(a.id),
        user_id: userId,
        house_id: String(h.id),
        name: a.name,
        tenant: a.tenant,
        tenant2: a.tenant2,
        persons: a.persons,
        kaltmiete: a.kaltmiete,
        warmmiete: a.warmmiete,
        deposit: a.deposit,
        notes: a.notes,
        tenant_phone: a.tenant_phone || null,
        tenant_email: a.tenant_email || null,
      }))
    );

    // =========================
    // DB APARTMENTS LADEN
    // =========================
    const {
      data: dbApartments,
      error: loadApartmentError,
    } = await supabase
      .from("apartments")
      .select("id")
      .eq("user_id", userId);

    if (loadApartmentError) {
      return saveFail(loadApartmentError, "Wohnungen laden");
    }

    const currentApartmentIds =
      apartments.map((a) => String(a.id));

    const dbApartmentIds = (
      dbApartments || []
    ).map((a) => String(a.id));

    // =========================
    // GELÖSCHTE APARTMENTS
    // =========================
    const deletedApartmentIds =
      dbApartmentIds.filter(
        (id) =>
          !currentApartmentIds.includes(id)
      );

    // =========================
    // APARTMENTS LÖSCHEN
    // =========================
    if (deletedApartmentIds.length > 0) {
      const {
        error: deleteApartmentError,
      } = await supabase
        .from("apartments")
        .delete()
        .in("id", deletedApartmentIds);

      if (deleteApartmentError) {
        return saveFail(deleteApartmentError, "Wohnungen löschen");
      }
    }

    if (apartments.length > 0) {
      const { error: apartmentError } = await supabase
        .from("apartments")
        .upsert(apartments);

      if (apartmentError) {
        return saveFail(apartmentError, "Wohnungen speichern");
      }
    }

    return saveOk();
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
      console.error(
        "❌ Termine laden:",
        error
      );
      return [];
    }

    return data || [];
  },

  async saveAppointments(userId, items) {
    if (!userId) return saveOk();

    // =========================
    // AKTUELLE IDS
    // =========================
    const currentIds = items.map((a) =>
      String(a.id)
    );

    // =========================
    // DB TERMINE LADEN
    // =========================
    const {
      data: dbAppointments,
      error: loadError,
    } = await supabase
      .from("appointments")
      .select("id")
      .eq("user_id", userId);

    if (loadError) {
      return saveFail(loadError, "Termine laden");
    }

    const dbIds = (dbAppointments || []).map((a) => String(a.id));
    const deletedIds = dbIds.filter((id) => !currentIds.includes(id));

    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("appointments")
        .delete()
        .in("id", deletedIds);

      if (deleteError) {
        return saveFail(deleteError, "Termine löschen");
      }
    }

    const { error } = await supabase.from("appointments").upsert(
      items.map((a) => ({
        id: String(a.id),
        user_id: userId,
        house_id: a.house_id || null,
        apartment_id: a.apartment_id || null,
        date: a.date,
        time: a.time || "00:00",
        description: a.description || "",
        appointment_type: a.appointment_type || "other",
        maintenance_interval_months: a.maintenance_interval_months
          ? Number(a.maintenance_interval_months)
          : null,
      }))
    );

    return error ? saveFail(error, "Termine speichern") : saveOk();
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
      console.error(
        "❌ Finanzen laden:",
        error
      );
      return [];
    }

    return data || [];
  },

  async saveTransactions(userId, items) {
    if (!userId) return saveOk();

    // =========================
    // AKTUELLE IDS
    // =========================
    const currentIds = items.map((t) =>
      String(t.id)
    );

    // =========================
    // DB FINANZEN LADEN
    // =========================
    const {
      data: dbTransactions,
      error: loadError,
    } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", userId);

    if (loadError) {
      return saveFail(loadError, "Buchungen laden");
    }

    const dbIds = (dbTransactions || []).map((t) => String(t.id));
    const deletedIds = dbIds.filter((id) => !currentIds.includes(id));

    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .in("id", deletedIds);

      if (deleteError) {
        return saveFail(deleteError, "Buchungen löschen");
      }
    }

    const { error } = await supabase.from("transactions").upsert(
      items.map((t) => ({
        id: String(t.id),
        user_id: userId,
        house_id: t.house_id || null,
        apartment_id: t.apartment_id || null,
        date: t.date,
        amount: t.amount,
        type: t.type,
        description: t.description,
      }))
    );

    return error ? saveFail(error, "Buchungen speichern") : saveOk();
  },

  // =========================
  // APP-NEWSFEED
  // =========================
  async checkIsSiteAdmin(email) {
    if (!email) return false;

    const { data, error } = await supabase
      .from("site_admins")
      .select("email")
      .ilike("email", email.trim())
      .maybeSingle();

    if (error) {
      console.warn("Admin-Check:", error.message);
      return false;
    }

    return !!data;
  },

  async getAppNews() {
    const { data, error } = await supabase
      .from("app_news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ News laden:", error);
      throw error;
    }

    return data || [];
  },

  async createAppNews({ title, body }) {
    const { data, error } = await supabase
      .from("app_news")
      .insert({ title, body })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAppNews(id, { title, body }) {
    const { data, error } = await supabase
      .from("app_news")
      .update({ title, body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAppNews(id) {
    const { error } = await supabase
      .from("app_news")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};