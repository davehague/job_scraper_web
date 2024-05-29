// stores/roleStore.js
import { defineStore } from 'pinia'

export const useJsaStore = defineStore('jsaStore', {
  state: () => ({
    selectedRoleId: 0 as number | undefined,
  }),
  actions: {
    setSelectedRoleId(role: number) {
      this.selectedRoleId = role
    }
  }
})
