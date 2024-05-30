import { defineStore } from 'pinia'
import { type User } from '@supabase/supabase-js'

export const useJsaStore = defineStore('jsaStore', {
  state: () => ({
    selectedRoleId: 0 as number | undefined,
    user: null as User | null,
  }),
  actions: {
    setSelectedRoleId(role: number) {
      this.selectedRoleId = role;
    },
    setUser(user: User | null) {
      this.user = user;
    },
    signOutUser() {
      this.user = null;
    }
  }
})
