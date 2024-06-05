<template>
  <header class="header">
    <div v-if="userIsNotLoggedIn" class="left">
      <select id="roles" v-model="selectedPublicUser">
        <option v-for="user in publicUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </div>
    <div class="right">
      <div v-if="store.authUser">
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
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { type User as DBUser } from '@/types/interfaces'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

import { supabase } from "@/utils/supabaseClient";
import { type AuthChangeEvent, type User, type Session } from "@supabase/supabase-js";

const router = useRouter()
const publicUsers = ref<DBUser[]>([]);
const showMenu = ref(false);
const selectedPublicUser = ref('');
const store = useJsaStore();

const userIsNotLoggedIn = ref(false);

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
    console.log('No existing user found:', result);
    store.signOutUser();
    return;
  }

  store.setAuthUser(result.data.user);
  store.getDBUser(); // Pre-fetch the DB user
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
  })
})

watch(selectedPublicUser, (newVal) => {
  store.setSelectedUserId(newVal);
})
</script>

<style scoped>
.header {
  border-radius: 10px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.left {
  display: flex;
  align-items: center;
  margin-right: 25px;
}

.sign-in {
  background-color: #455a64;
  color: white;
}

.sign-in:hover {
  background-color: #333;
}

#roles {
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
}

#roles:focus {
  border-color: #007bff;
}

.right {
  display: flex;
  align-items: center;
  position: relative;
}

.profile-pic {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #eee;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
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
