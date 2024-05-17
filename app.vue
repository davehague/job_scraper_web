<!-- pages/app.vue -->
<template>
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
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useNuxtApp } from '#app'
import JobCard from '~/components/JobCard.vue'
import { type Job } from '~/types/job'
import { type Role } from '~/types/role'


export default defineComponent({
  components: {
    JobCard
  },
  setup() {
    const jobs = ref<Job[]>([])
    const roles = ref<Role[]>([])
    const selectedRole = ref<number>()

    const fetchJobs = async () => {
      const { $supabase } = useNuxtApp()
      const { data: items, error } = await ($supabase as any)
        .from('jobs')
        .select('*')

      if (error) {
        console.error(error)
      } else {
        jobs.value = (items as Job[])
          .filter(job => parseInt(job.score) >= 70)
          .sort((a, b) => {
            const dateComparison = new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime()
            if (dateComparison !== 0) {
              return dateComparison
            }
            return parseInt(b.score) - parseInt(a.score)
          })
      }
    }

    const fetchRoles = async () => {
      const { $supabase } = useNuxtApp()
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

    onMounted(() => {
      fetchJobs()
      fetchRoles()
    })

    return {
      roles,
      selectedRole,
      filteredJobs
    }
  }
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
</style>