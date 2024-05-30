import { supabase } from "@/utils/supabaseClient";

export default class PersistentDataService {
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
}
