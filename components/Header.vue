<template>
  <header class="header">
    <div class="left">
      <select id="roles" v-model="selectedRole">
        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
      </select>
    </div>
    <div class="right">
      <div v-if="user">
        <img src="/public/profile.png" class="profile-pic" @click="toggleMenu" />
        <div v-if="showMenu" class="dropdown-menu">
          <button @click="goToProfile">Profile</button>
          <button @click="signOut">Sign Out</button>
        </div>
      </div>
      <div v-else>
        <button @click="signIn">Sign In</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { type Role } from '@/types/role'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

import { supabase } from "@/utils/supabaseClient";
import { type AuthChangeEvent, type User, type Session } from "@supabase/supabase-js";

const router = useRouter()

let user = ref<User | null>(null);
const roles = ref<Role[]>([]);
const showMenu = ref(false);
const selectedRole = ref<number>(0);
const store = useJsaStore();

const fetchRoles = async () => {
  const items = await PersistentDataService.multiRecordFetch("roles");
  roles.value = items as Role[];
  const roleId = parseInt(roles.value[0].id);
  store.setSelectedRoleId(roleId);
  selectedRole.value = roleId;
}

const checkUser = async () => {
  console.log('Checking user');
  const result = await supabase.auth.getUser();
  console.log('Result:', result);
  store.setUser(result.data.user);
  user.value = result.data.user;
  console.log('User:', user.value);
}

const signOut = async () => {
  const result = await supabase.auth.signOut();
  if (result.error != null) console.error('Sign-out error:', result)
  store.signOutUser();
  user.value = null;
  router.push('/login')
}

const signIn = () => {
  router.push('/login')
}

const goToProfile = () => {
  router.push('/userprofile')
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

onMounted(async () => {
  await fetchRoles();
  await checkUser();

  supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    store.setUser(session?.user || null);
  })
})

watch(selectedRole, (newVal) => {
  store.setSelectedRoleId(newVal);
})
</script>

<style scoped>
.header {
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.left {
  display: flex;
  align-items: center;
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
