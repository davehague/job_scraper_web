<template>
  <header class="header">
    <div class="left">
      <select id="roles" v-model="selectedRole">
        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
      </select>
    </div>
    <div class="right">
      <div v-if="user">
        <img src="https://via.placeholder.com/40" class="profile-pic" @click="toggleMenu" />
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
import { useNuxtApp, useRouter } from '#app'
import { type Role } from '@/types/role'
import { useJsaStore } from '@/stores/jsaStore'


const { $supabase } = useNuxtApp()
const router = useRouter()

const user = ref(null)
const roles = ref<Role[]>([])
const showMenu = ref(false)
const selectedRole = ref<number>(0)
const store = useJsaStore()

const fetchRoles = async () => {
  const { data: items, error } = await ($supabase as any).from('roles').select('*')
  if (error) {
    console.error(error)
  } else {
    roles.value = items as Role[];

    const roleId = parseInt(roles.value[0].id);
    store.setSelectedRoleId(roleId);
    selectedRole.value = roleId;
  }
}

const checkUser = async () => {
  const { data } = await ($supabase as any).auth.getUser()
  user.value = data.user
}

const signOut = async () => {
  const { error } = await ($supabase as any).auth.signOut()
  if (error) console.error('Sign-out error:', error)
  user.value = null
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
  ($supabase as any).auth.onAuthStateChange((event: any, session: { user: null }) => {
    user.value = session?.user || null
  })
})

watch(selectedRole, (newVal) => {
  store.setSelectedRoleId(newVal);
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
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
}

.dropdown-menu button {
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.dropdown-menu button:hover {
  background-color: #f1f1f1;
}
</style>
