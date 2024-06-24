import { defineStore } from "pinia";
import { type User as AuthUser } from "@supabase/supabase-js";
import { type User as DBUser } from "@/types/interfaces";
import PersistentDataService from "~/services/PersistentDataService";

export const useJsaStore = defineStore("jsaStore", {
  state: () => ({
    selectedUserId: "",
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
    },
    signOutUser() {
      this.authUser = null;
      this.dbUser = null;
    },
  },
});
