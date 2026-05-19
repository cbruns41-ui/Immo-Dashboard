import { supabase } from "../supabase/supabaseClient";

/**
 * =========================
 * HOUSE SERVICE (Supabase)
 * =========================
 */

export const supabaseHouseService = {
  // =========================
  // GET ALL HOUSES (with apartments)
  // =========================
  async getHouses(userId) {
    const { data, error } = await supabase
      .from("houses")
      .select(`
        *,
        apartments (*)
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("getHouses error:", error);
      return [];
    }

    return (data || []).map(normalizeHouse);
  },

  // =========================
  // CREATE HOUSE
  // =========================
  async createHouse(userId, house) {
    const { data, error } = await supabase
      .from("houses")
      .insert([
        {
          user_id: userId,
          name: house.name || "Neues Haus",
          costs: house.costs || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("createHouse error:", error);
      return null;
    }

    return normalizeHouse(data);
  },

  // =========================
  // UPDATE HOUSE
  // =========================
  async updateHouse(houseId, updates) {
    const { data, error } = await supabase
      .from("houses")
      .update({
        name: updates.name,
        costs: updates.costs,
      })
      .eq("id", houseId)
      .select()
      .single();

    if (error) {
      console.error("updateHouse error:", error);
      return null;
    }

    return normalizeHouse(data);
  },

  // =========================
  // DELETE HOUSE
  // =========================
  async deleteHouse(houseId) {
    const { error } = await supabase
      .from("houses")
      .delete()
      .eq("id", houseId);

    if (error) {
      console.error("deleteHouse error:", error);
      return false;
    }

    return true;
  },

  // =========================
  // APARTMENTS
  // =========================

  async addApartment(houseId, apartment) {
    const { data, error } = await supabase
      .from("apartments")
      .insert([
        {
          house_id: houseId,
          name: apartment.name,
          tenant: apartment.tenant,
          tenant2: apartment.tenant2,
          persons: apartment.persons || 1,
          kaltmiete: apartment.kaltmiete || 0,
          warmmiete: apartment.warmmiete || 0,
          deposit: apartment.deposit || 0,
          notes: apartment.notes || "",
          user_id: apartment.user_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("addApartment error:", error);
      return null;
    }

    return data;
  },

  async updateApartment(apartmentId, updates) {
    const { data, error } = await supabase
      .from("apartments")
      .update({
        name: updates.name,
        tenant: updates.tenant,
        tenant2: updates.tenant2,
        persons: updates.persons,
        kaltmiete: updates.kaltmiete,
        warmmiete: updates.warmmiete,
        deposit: updates.deposit,
        notes: updates.notes,
      })
      .eq("id", apartmentId)
      .select()
      .single();

    if (error) {
      console.error("updateApartment error:", error);
      return null;
    }

    return data;
  },

  async deleteApartment(apartmentId) {
    const { error } = await supabase
      .from("apartments")
      .delete()
      .eq("id", apartmentId);

    if (error) {
      console.error("deleteApartment error:", error);
      return false;
    }

    return true;
  },
};

/**
 * =========================
 * NORMALIZER (WICHTIG)
 * =========================
 */
function normalizeHouse(house) {
  return {
    ...house,

    costs: house.costs || {},

    apartments: (house.apartments || []).map((a) => ({
      ...a,
      persons: Number(a.persons) || 1,
      kaltmiete: Number(a.kaltmiete) || 0,
      warmmiete: Number(a.warmmiete) || 0,
      deposit: Number(a.deposit) || 0,
    })),
  };
}