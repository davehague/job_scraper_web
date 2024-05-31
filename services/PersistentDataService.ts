import { supabase } from "@/utils/supabaseClient";
import { type User, type UserConfig } from "@/types/interfaces";

export default class PersistentDataService {
  // ============= GENERAL ============= //
  static async multiRecordFetch(tableName: string) {
    const query = supabase.from(tableName).select("*");
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }

    return data;
  }

  static async singleRecordFetch(tableName: string, recordId: string) {
    const query = supabase.from(tableName).select("*").eq("id", recordId);
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  // ============= userProfile.vue ============= //
  static async upsertUser(user: User) {
    const query = supabase.from("users").upsert([user]).select();
    const { data, error } = await query;

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    return data; // Upserted user
  }

  static async fetchUserConfigs(userId: string) 
  : Promise<UserConfig[] | [null]>{
    // TODO:  table swap
    const query = supabase.from("role_configs").select("*").eq("user_id", userId);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user_configs:", error);
      throw error;
    }

    return data;
  }
}
