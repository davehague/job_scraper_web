import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const profilePicUrl = ref('/profile.png'); // Default profile picture URL

  const setProfilePicUrl = (url: string) => {
    profilePicUrl.value = url;
  };

  return {
    profilePicUrl,
    setProfilePicUrl,
  };
});
