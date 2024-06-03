import { supabase } from "@/utils/supabaseClient";
import { type User, type UserConfig, type Job } from "@/types/interfaces";

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

  // ============= index.vue ============= //
  static async fetchPublicUsers() {
    const query = supabase.from("users").select("*").eq("is_public", true);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching public users:", error);
      throw error;
    }

    return data;
  }

  static async fetchJobsForUsers(users: { id: string }[]) {
    const userIds = users.map((user) => user.id);

    const { data, error } = await supabase
      .from('users_jobs')
      .select('user_id, score, interested, jobs(*)')
      .in('user_id', userIds);
  
    if (error) {
      console.error('Error fetching jobs for users:', error);
      throw error;
    }
  
    console.log('Fetched jobs for users:', data);
    return data.map((record) => ({
      ...record.jobs,
      user_id: record.user_id,
      user_score: record.score,
      user_interested: record.interested,
    }));
  }

  // ============= userProfile.vue ============= //
  static async upsertUser(user: User) {
    const query = supabase.from("users").upsert([user]).select();
    const { data, error } = await query;

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  static async fetchUserConfigs(userId: string): Promise<UserConfig[] | []> {
    const query = supabase
      .from("user_configs")
      .select("*")
      .eq("user_id", userId);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user_configs:", error);
      throw error;
    }

    return data;
  }

  static async updateUserConfig(config: UserConfig) {
    const query = supabase.from("role_configs").upsert([config]).select();
    const { data, error } = await query;

    if (error) {
      console.error("Error updating user config:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  static async insertUserConfig(config: UserConfig) {
    const query = supabase
      .from("role_configs")
      .insert({
        key: config.key,
        string_value: config.string_value,
        int_value: config.int_value,
        bool_value: config.bool_value,
        user_id: config.user_id,
      })
      .select();
    const { data, error } = await query;

    if (error) {
      console.error("Error inserting user config:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  static async deleteUserConfig(configId: number) {
    const query = supabase
      .from("role_configs")
      .delete()
      .eq("id", configId)
      .select();
    const { data, error } = await query;

    if (error) {
      console.error("Error deleting user config:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }
}
