import { supabase } from "@/utils/supabaseClient";
// import type {

// } from '@/types/interfaces';

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
}
