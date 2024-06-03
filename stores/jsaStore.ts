import { defineStore } from "pinia";
import { type User as AuthUser } from "@supabase/supabase-js";
import { type User as DBUser } from "@/types/interfaces";
import PersistentDataService from "~/services/PersistentDataService";

export const useJsaStore = defineStore("jsaStore", {
  state: () => ({
    selectedUserId: '',
    authUser: null as AuthUser | null,
    dbUser: null as DBUser | null,
  }),
  actions: {
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
          console.error("Error fetching user data:", error);
          throw error;
        }
        this.authUser = data.user;
        return this.authUser;
      }
    },
    async refreshDBUser() {
      console.log("Refreshing DB user data...");
      this.dbUser = null;
      return this.getDBUser();
    },
    async getDBUser() {
      if (this.dbUser != null && this.dbUser != undefined) {
        return this.dbUser;
      } else if (this.authUser != null) {
        console.log("Fetching user from DB with ID =", this.authUser.id);
        const data = await PersistentDataService.singleRecordFetch(
          "users",
          this.authUser.id
        );

        this.dbUser = data;
        return this.dbUser;
      } else {
        console.error("No user data found");
      }
    },
    setAuthUser(user: AuthUser | null) {
      this.authUser = user;
    },
    setDBUser(user: DBUser | null) {
      this.dbUser = user;
    },
    signOutUser() {
      this.authUser = null;
      this.dbUser = null;
    },
  },
});
