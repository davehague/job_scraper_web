<!-- pages/index.vue -->
<template>
  <div>
    <div v-if="!user">
      <button @click="signIn">Sign In</button>
    </div>
    <div v-else>
      <div>{{ (user as any).email }}</div>
      <button @click="signOut">Sign Out</button>
    </div>

    <div>
      <div class="role-filter">
        <select id="roles" v-model="selectedRole">
          <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
      </div>

      <div class="job-list">
        <JobCard v-for="job in filteredJobs" :key="job.id" :job="job" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp, useRouter } from '#app'
import { type Job } from '@/types/job'
import { type Role } from '@/types/role'

const user = ref(null)
const jobs = ref<Job[]>([])
const roles = ref<Role[]>([])
const selectedRole = ref<number>()

const { $supabase } = useNuxtApp()
const router = useRouter()

const fetchJobs = async () => {
  const { data: items, error } = await ($supabase as any)
    .from('jobs')
    .select('*')

  if (error) {
    console.error(error)
  } else {
    jobs.value = (items as Job[])
      .filter(job => parseInt(job.score) >= 70)
      .sort((a, b) => {
        const dateA = new Date(a.date_posted || a.date_pulled).getTime()
        const dateB = new Date(b.date_posted || b.date_pulled).getTime()
        const dateComparison = dateB - dateA
        if (dateComparison !== 0) {
          return dateComparison
        }
        return parseInt(b.score) - parseInt(a.score)
      })
  }
}

const fetchRoles = async () => {
  const { data: items, error } = await ($supabase as any)
    .from('roles')
    .select('*')

  if (error) {
    console.error(error)
  } else {
    roles.value = items as Role[]
    selectedRole.value = items[0].id
  }
}

const filteredJobs = computed(() => {
  if (!selectedRole.value) {
    return jobs.value
  }
  return jobs.value.filter(job => job.role_id === selectedRole.value)
})

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

onMounted(async () => {
  await fetchJobs();
  await fetchRoles();
  await checkUser();

  ($supabase as any).auth.onAuthStateChange((event: any, session: { user: null }) => {
    user.value = session?.user || null
  })
})
</script>

<style scoped>
.role-filter {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
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

.job-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-items: center;
}
</style>