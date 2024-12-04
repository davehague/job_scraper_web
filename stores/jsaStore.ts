import { defineStore } from "pinia";
import { type User as AuthUser } from "@supabase/supabase-js";
import { type User as DBUser, type Job } from "@/types/interfaces";
import PersistentDataService from "~/services/PersistentDataService";
import { setMixpanelUser, resetMixpanelUser, transformDataToJobs } from '~/utils/helpers';

export const useJsaStore = defineStore("jsaStore", {
  state: () => ({
    selectedUserId: "",
    authUser: null as AuthUser | null,
    dbUser: null as DBUser | null,
    currentJobs: [] as Job[],
  }),
  actions: {
    async refreshJobs(currentUserId: string) {
      if (this.currentJobs.length > 0) {
        console.log("Jobs already loaded, skipping refresh");
        return;
      }

      const rawItems = await PersistentDataService.fetchJobsForUser(
        currentUserId
      );
      this.currentJobs = transformDataToJobs(rawItems);
      console.log("Current jobs from raw items:", this.currentJobs);
    },
    getJobById(jobId: string): Job | undefined {
      return this.currentJobs.find((job) => job.id === jobId);
    },
    setSelectedUserId(userId: string) {
      this.selectedUserId = userId;
    },
    async getAuthUser() {
      if (this.authUser != null) {
        return this.authUser;
      } else {
        console.log("Checking if the user is already logged in...");
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.log("User was not logged in");
          return null;
        }
        this.authUser = data.user;
        return this.authUser;
      }
    },
    async refreshDBUser() {
      console.log("Refreshing DB user data...");
      this.dbUser = null;
      const refreshedUser = await this.getDBUser();
      return refreshedUser;
    },
    async getDBUser() {
      if (this.dbUser != null && this.dbUser != undefined) {
        return this.dbUser;
      } else if (this.authUser != null) {
        console.log("Fetching user from DB with ID =", this.authUser.id);

        try {
          const data = await PersistentDataService.singleRecordFetch(
            "users",
            this.authUser.id
          );
          if (data == null) {
            console.log("User not found in DB");
            return null;
          } else {
            console.log("User found in DB", data);
            this.dbUser = data;
            setMixpanelUser(this.dbUser);
            return this.dbUser;
          }
        } catch {
          console.error("Error fetching user from DB:");
        }
      }
    },
    setAuthUser(user: AuthUser | null) {
      this.authUser = user;
    },
    setDBUser(user: DBUser | null) {
      this.dbUser = user;
      if (user != null) {
        setMixpanelUser(user);
      }
    },
    async signOutUser() {
      const result = await supabase.auth.signOut();
      if (result.error != null) console.error("Sign-out error:", result);

      this.authUser = null;
      this.dbUser = null;
      this.selectedUserId = "";
      resetMixpanelUser();
    },
  },
});
