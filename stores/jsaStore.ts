import { defineStore } from 'pinia'
import { type User as AuthUser } from '@supabase/supabase-js'
import { type User as DBUser} from '@/types/interfaces'

export const useJsaStore = defineStore('jsaStore', {
  state: () => ({
    selectedRoleId: 0 as number | undefined,
    authUser: null as AuthUser | null,
    dbUser: null as DBUser | null
  }),
  actions: {
    setSelectedRoleId(role: number) {
      this.selectedRoleId = role;
    },
    setAuthUser(user: AuthUser | null) {
      this.authUser = user;
    },
    setDBUser(user: DBUser) {
      this.dbUser = user;
    },
    signOutUser() {
      this.authUser = null;
    }
  }
})
