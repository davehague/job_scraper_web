<template>
  <header class="header">
    <div class="title-row">
      <div class="left">
        <h2 class="app-name">My Great Job App</h2>
      </div>
      <div class="right">
        <select v-if="userIsNotLoggedIn" id="roles" v-model="selectedPublicUser">
          <option v-for="user in publicUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
        <div class="user-details" v-if="store.authUser">
          <div class="username">{{ userName }}</div>
          <img src="/public/profile.png" class="profile-pic" @click="toggleProfileMenu" />
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
    <div class="link-row">
      <button class="link" :class="{ selected: selectedLink === 'latestSearch' }"
        @click="handleClick('latestSearch')">Latest Search</button>
      <button class="link" :class="{ selected: selectedLink === 'savedResults' }"
        @click="handleClick('savedResults')">Saved Results</button>
      <button class="link" :class="{ selected: selectedLink === 'viewApplied' }"
        @click="handleClick('viewApplied')">View Applied</button>
      <button class="link" :class="{ selected: selectedLink === 'viewDiscards' }"
        @click="handleClick('viewDiscards')">View Discards</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { type User as DBUser } from '@/types/interfaces'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

import { supabase } from "@/utils/supabaseClient";
import { type AuthChangeEvent, type Session } from "@supabase/supabase-js";

const emitFilter = defineEmits(['filter']);
const selectedLink = ref('latestSearch');

const router = useRouter()
const publicUsers = ref<DBUser[]>([]);
const showMenu = ref(false);
const selectedPublicUser = ref('');
const store = useJsaStore();
const userName = ref('');

const userIsNotLoggedIn = ref(false);

const handleClick = (filterType: string) => {
  selectedLink.value = filterType;
  emitFilter('filter', filterType);
};

const fetchRoles = async () => {
  const items = await PersistentDataService.fetchPublicUsers() as DBUser[];
  publicUsers.value = items;
  const userId = publicUsers.value[0].id;
  store.setSelectedUserId(userId);
  selectedPublicUser.value = userId;
}

const checkUser = async () => {
  const result = await supabase.auth.getUser();
  if (result.error != null) {
    store.signOutUser();
    return;
  }

  store.setAuthUser(result.data.user);
  await store.getDBUser(); // Pre-fetch the DB user
  userName.value = store.dbUser?.name && store.dbUser.name.length > 0 ? store.dbUser.name : store.dbUser?.email || '';
}

const signOut = async () => {
  const result = await supabase.auth.signOut();
  if (result.error != null) console.error('Sign-out error:', result)

  store.signOutUser();
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
  await fetchRoles();
  await checkUser();

  if (!store.authUser) {
    userIsNotLoggedIn.value = true;
  }

  supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    store.setAuthUser(session?.user || null);
  });
})

watch(selectedPublicUser, (newVal) => {
  store.setSelectedUserId(newVal);
})
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  background: #234F5B;
}

.title-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px 20px;
}

.link-row {
  display: flex;
  flex-direction: row;
  justify-content: start;
  gap: 48px;
  padding: 10px 0;
  margin-left: 20px;
}

.link {
  background: none;
  border: none;
  border-radius: 0;
  color: #FFFFFF;
  display: inline;
  cursor: pointer;
  font-size: 24px;
  font-weight: 700;
  padding: 4px 0;
  margin-right: 10px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  width: fit-content;
}

.link:hover,
.link:focus {
  box-shadow: 0 4px 0 0 #59C9A5;
  color: #FFFFFF;
  outline: none;
}

.selected {
  box-shadow: 0 4px 0 0 #59C9A5;
}

.app-name {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
}

.left {
  display: flex;
  align-items: center;
  margin-right: 25px;
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
}

.profile-pic {
  width: 64px;
  height: 64px;
  margin-top: 32px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #eee;
}

.username {
  font-size: 24px;
  margin-top: 40px;
  font-weight: 400;
  color: white;
  margin-right: 20px;
  display: flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute;
  top: 96px;
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
