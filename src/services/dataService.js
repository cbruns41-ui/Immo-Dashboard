import { supabase } from "../supabase/supabaseClient";

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
    if (!userId) return;

    const { error } = await supabase
      .from("vermieter")
      .upsert(
        {
          user_id: userId,
          ...dataVermieter,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("❌ Vermieter speichern:", error);
    }
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
      console.error(
        "❌ Houses laden:",
        loadHouseError
      );
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
        console.error(
          "❌ Apartments löschen:",
          deleteApartmentsError
        );
      }

      // Dann Häuser löschen
      const {
        error: deleteHouseError,
      } = await supabase
        .from("houses")
        .delete()
        .in("id", deletedHouseIds);

      if (deleteHouseError) {
        console.error(
          "❌ Houses löschen:",
          deleteHouseError
        );
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
          costs: h.costs || {},
        }))
      );

    if (error) {
      console.error(
        "❌ Houses speichern:",
        error
      );
    }

    // =========================
    // APARTMENTS AUFBEREITEN
    // =========================
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
      console.error(
        "❌ Apartments laden:",
        loadApartmentError
      );
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
        console.error(
          "❌ Apartments löschen:",
          deleteApartmentError
        );
      }
    }

    // =========================
    // APARTMENTS SPEICHERN
    // =========================
    if (apartments.length > 0) {
      const {
        error: apartmentError,
      } = await supabase
        .from("apartments")
        .upsert(apartments);

      if (apartmentError) {
        console.error(
          "❌ Apartments speichern:",
          apartmentError
        );
      }
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
      console.error(
        "❌ Termine laden:",
        error
      );
      return [];
    }

    return data || [];
  },

  async saveAppointments(userId, items) {
    if (!userId) return;

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
      console.error(
        "❌ Termine laden:",
        loadError
      );
    }

    const dbIds = (
      dbAppointments || []
    ).map((a) => String(a.id));

    // =========================
    // GELÖSCHTE FINDEN
    // =========================
    const deletedIds = dbIds.filter(
      (id) => !currentIds.includes(id)
    );

    // =========================
    // GELÖSCHTE LÖSCHEN
    // =========================
    if (deletedIds.length > 0) {
      const { error: deleteError } =
        await supabase
          .from("appointments")
          .delete()
          .in("id", deletedIds);

      if (deleteError) {
        console.error(
          "❌ Termine löschen:",
          deleteError
        );
      }
    }

    // =========================
    // TERMINE SPEICHERN
    // =========================
    const { error } = await supabase
      .from("appointments")
      .upsert(
        items.map((a) => ({
          id: String(a.id),
          user_id: userId,
          house_id: a.house_id || null,
          apartment_id:
            a.apartment_id || null,
          date: a.date,
          time: a.time || "00:00",
          description:
            a.description || "",
        }))
      );

    if (error) {
      console.error(
        "❌ Termine speichern:",
        error
      );
    }
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
    if (!userId) return;

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
      console.error(
        "❌ Finanzen laden:",
        loadError
      );
    }

    const dbIds = (
      dbTransactions || []
    ).map((t) => String(t.id));

    // =========================
    // GELÖSCHTE FINDEN
    // =========================
    const deletedIds = dbIds.filter(
      (id) => !currentIds.includes(id)
    );

    // =========================
    // GELÖSCHTE LÖSCHEN
    // =========================
    if (deletedIds.length > 0) {
      const { error: deleteError } =
        await supabase
          .from("transactions")
          .delete()
          .in("id", deletedIds);

      if (deleteError) {
        console.error(
          "❌ Finanzen löschen:",
          deleteError
        );
      }
    }

    // =========================
    // FINANZEN SPEICHERN
    // =========================
    const { error } = await supabase
      .from("transactions")
      .upsert(
        items.map((t) => ({
          id: String(t.id),
          user_id: userId,
          house_id: t.house_id || null,
          apartment_id:
            t.apartment_id || null,
          date: t.date,
          amount: t.amount,
          type: t.type,
          description: t.description,
        }))
      );

    if (error) {
      console.error(
        "❌ Finanzen speichern:",
        error
      );
    }
  },
};