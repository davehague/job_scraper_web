<template>
  <header class="header">
    <div class="title-row">
      <div class="left">
        <h2 class="app-name">Job Scout</h2>
      </div>
      <div class="right">
        <select v-if="userIsNotLoggedIn" id="roles" v-model="selectedUser">
          <option v-for="user in publicUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
        <select v-if="userIsAdmin" id="roles" v-model="selectedUser">
          <option v-for="user in allUsers" :key="user.id" :value="user.id">{{ user.email }}</option>
        </select>
        <div class="user-details" @click="toggleProfileMenu" v-if="store.authUser">
          <div class="username">{{ userName }}</div>
          <img :src="userProfileURL" class="profile-pic" alt="User profile picture" />
          <div v-if="showMenu" class="dropdown-menu">
            <button @click="goToProfile">Profile</button>
            <button @click="signOut">Sign Out</button>
          </div>
        </div>
        <div v-else>
          <button class="sign-in" @click="goToSignIn">Sign In</button>
        </div>
      </div>
    </div>
    <div v-if="shouldShowLinkRow" class="link-row">
      <button class="link" :class="{ selected: selectedLink === 'latestSearch' }"
        @click="handleClick('latestSearch')">Latest Search</button>
      <button class="link" :class="{ selected: selectedLink === 'savedResults' }"
        @click="handleClick('savedResults')">Saved Results</button>
      <button class="link" :class="{ selected: selectedLink === 'viewApplied' }"
        @click="handleClick('viewApplied')">View Applied</button>
      <button class="link" :class="{ selected: selectedLink === 'viewDiscards' }"
        @click="handleClick('viewDiscards')">View Discards</button>
    </div>
    <div @click="router.back()" v-if="shouldShowBackButton" class="back-row">
      <i class="fas fa-arrow-left"></i>
      <button class="link">Back to Results</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from '#app'
import { type User as DBUser } from '@/types/interfaces'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

import { supabase } from "@/utils/supabaseClient";
import { type AuthChangeEvent, type Session } from "@supabase/supabase-js";

const props = withDefaults(defineProps<{
  selectedFilter?: string
}>(), {
  selectedFilter: 'latestSearch'
})

const emitFilter = defineEmits(['filter']);
const selectedLink = ref('');

const router = useRouter()
const publicUsers = ref<DBUser[]>([]);
const allUsers = ref<DBUser[]>([]);
const showMenu = ref(false);
const selectedUser = ref('');
const store = useJsaStore();
const userName = ref('');
const userProfileURL = computed(() => {
  return store.dbUser?.avatar_url || '/profile.png'
})

const userIsNotLoggedIn = ref(false);
const userIsAdmin = ref(false);

const shouldShowLinkRow = computed(() => {
  if (userIsNotLoggedIn.value) return false;
  return !router.currentRoute.value.path.includes('job');
})

const shouldShowBackButton = computed(() => {
  return router.currentRoute.value.path.includes('job');
})

const handleClick = (filterType: string) => {
  selectedLink.value = filterType;
  emitFilter('filter', filterType);
};

const fetchRoles = async (type: string) => {
  if (type === 'public') {
    const items = await PersistentDataService.fetchPublicUsers() as DBUser[];
    publicUsers.value = items.sort((a, b) => a.name.localeCompare(b.name));
    const userId = publicUsers.value[0].id;
    store.setSelectedUserId(userId);
    selectedUser.value = userId;
  }
  else if (type === 'all') {
    let items = await PersistentDataService.fetchNonPublicUsers() as DBUser[];
    allUsers.value = items.sort((a, b) => a.email.localeCompare(b.email));
    const userId = allUsers.value.filter(user => user.email === store.authUser?.email)[0].id;
    store.setSelectedUserId(userId);
    selectedUser.value = userId;
  }
}

const checkUserLoginStatus = async () => {
  const result = await supabase.auth.getUser();
  if (result.error != null) {
    await store.signOutUser();
    return;
  }

  store.setAuthUser(result.data.user);
  await store.getDBUser(); // Pre-fetch the DB user
  userName.value = store.dbUser?.name && store.dbUser.name.length > 0 ? store.dbUser.name : store.dbUser?.email || '';
}

const signOut = async () => {
  await store.signOutUser();
  router.push('/login')
}

const goToSignIn = () => {
  router.push('/login')
}

const goToProfile = () => {
  router.push('/userprofile')
}

const toggleProfileMenu = () => {
  showMenu.value = !showMenu.value
}

onMounted(async () => {
  await checkUserLoginStatus();

  if (!store.authUser) {
    userIsNotLoggedIn.value = true;
    await fetchRoles('public');
  }

  if (store.dbUser?.is_admin) {
    userIsAdmin.value = true;
    await fetchRoles('all');
  }

  supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    store.setAuthUser(session?.user || null);
  });

  handleClick(props.selectedFilter || 'latestSearch');
})

watch(selectedUser, (newVal) => {
  console.log('Setting a new selected user:', newVal);
  store.setSelectedUserId(newVal);
})

watch(() => props.selectedFilter, (newVal) => {
  const validFilter = ['latestSearch', 'savedResults', 'viewApplied', 'viewDiscards'].includes(newVal);
  console.log('New filter:', newVal, 'Valid:', validFilter);
  if (validFilter)
    handleClick(newVal);
  }
)

</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #234F5B;
  min-height: 120px;
}

.title-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 24px 40px 0 40px;
  height: 64px;
}

.link-row {
  display: flex;
  flex-direction: row;
  justify-content: start;
  gap: 48px;
  margin: 20px 40px;
}

.back-row {
  display: flex;
  flex-direction: row;
  justify-content: start;
  gap: 12px;
  margin: 20px 40px;
  align-items: center;
  cursor: pointer;
}

i {
  color: #59C9A5;
  height: 16px;
  width: 16px;
}

.link {
  background: none;
  border: none;
  border-radius: 0;
  color: #FFFFFF;
  display: inline;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  padding: 4px 0;

  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  width: fit-content;
}

.back-row:hover .link,
.back-row:focus-within .link {
  box-shadow: 0 4px 0 0 #59C9A5;
  color: #FFFFFF;
  outline: none;
}

.back-row:hover .fas,
.back-row:focus-within .fas {
  color: #fff;
}

.selected {
  box-shadow: 0 4px 0 0 #59C9A5;
}

.app-name {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.left {
  display: flex;
  align-items: center;
}

.sign-in {
  background-color: #333;
  color: white;
}

.sign-in:hover {
  background-color: #555;
}

#roles {
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
  margin-right: 20px;
}

#roles:focus {
  border-color: #000;
}

.right {
  display: flex;
  align-items: center;
  position: relative;
  flex-direction: row;
  justify-content: flex-end;
}

.user-details {
  display: flex;
  height: 64px;
}

.profile-pic {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #eee;
}

.username {
  font-size: 20px;
  font-weight: 400;
  color: white;
  margin-right: 20px;
  display: flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute;
  top: 72px;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: flex;
  flex-direction: column;
  width: 150px;
  z-index: 1000;
}

.dropdown-menu button {
  padding: 10px;
  border: none;
  background: none;
  color: black;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.dropdown-menu button:hover {
  background-color: #f1f1f1;
}
</style>
