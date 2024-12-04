import { supabase } from "@/utils/supabaseClient";
import { type User, type UserConfig, type UsersJobs } from "@/types/interfaces";

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

  // ============= Login ============= //
  static async fetchUserByEmail(email: string): Promise<User | null> {
    const query = supabase.from("users").select("*").eq("email", email);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  static async updateLastLogin(userId: string) {
    const query = supabase
      .from("users")
      .update({ last_login: new Date() })
      .eq("id", userId)
      .select();
    const { data, error } = await query;

    if (error) {
      console.error("Error updating last login:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  // ============= base.vue ============= //
  static async fetchPublicUsers() {
    const query = supabase.from("users").select("*").eq("is_public", true);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching public users:", error);
      throw error;
    }

    return data;
  }

  static async fetchNonPublicUsers() {
    const query = supabase.from("users").select("*").neq("is_public", true);;
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    return data;
  }

  static async fetchJobsForUsers(users: { id: string }[]) {
    const userIds = users.map((user) => user.id);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from("recent_high_score_jobs")
      .select("*")
      .in("user_id", userIds)
      .gte("created_at", daysAgo.toISOString());

    if (error) {
      console.error("Error fetching jobs for users:", error);
      throw error;
    }

    return data;
  }

  static async fetchJobsForUser(userId: string) {
    const { data, error } = await supabase
      .from("recent_high_score_jobs")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching jobs for user:", error);
      throw error;
    }

    return data;
  }

  // ============= JobCard.vue ============= //
  static async setUserInterest(
    userId: string,
    jobId: string,
    interested: boolean | null
  ) {
    const query = supabase
      .from("users_jobs")
      .upsert([{ user_id: userId, job_id: jobId, interested }])
      .select();
    const { data, error } = await query;

    if (error) {
      console.error("Error updating user interest:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  static async getUserInterest(
    userId: string,
    jobId: string
  ): Promise<UsersJobs | null> {
    const query = supabase
      .from("users_jobs")
      .select("interested")
      .eq("user_id", userId)
      .eq("job_id", jobId);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user interest:", error);
      throw error;
    }

    return data.length > 0 ? (data[0] as UsersJobs) : null;
  }

  static async setHasApplied(userId: string, jobId: string, has_applied: boolean) {
    const query = supabase
      .from("users_jobs")
      .upsert([{ user_id: userId, job_id: jobId, has_applied }])
      .select();
    const { data, error } = await query;

    if (error) {
      console.error("Error marking as applied:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  // ============= userProfile.vue ============= //
  static async fetchUserById(id: string): Promise<User | null> {
    const query = supabase.from("users").select("*").eq("id", id);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user by id:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

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

  static async fetchUserConfigsByKey(userId: string, key: string): Promise<UserConfig[] | []> {
    const query = supabase
      .from("user_configs")
      .select("*")
      .eq("user_id", userId)
      .eq("key", key);
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user_configs:", error);
      throw error;
    }

    return data;
  }

  static async updateUserConfig(config: UserConfig) {
    const query = supabase.from("user_configs").upsert([config]).select();
    const { data, error } = await query;

    if (error) {
      console.error("Error updating user config:", error);
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  static async insertUserConfig(config: UserConfig) {
    const query = supabase
      .from("user_configs")
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
      .from("user_configs")
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
