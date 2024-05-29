<template>
  <div>
    <Header />
    <div class="job-list">
      <JobCard v-for="job in filteredJobs" :key="job.id" :job="job" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import { useNuxtApp } from '#app'
import { type Job } from '@/types/job'
import Header from '@/components/Header.vue'
import { useJsaStore } from '@/stores/jsaStore'

const jobs = ref<Job[]>([])
const { $supabase } = useNuxtApp()
const store = useJsaStore()

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

const filteredJobs = computed(() => {
  const selectedRoleId = store.selectedRoleId;
  return jobs.value.filter(job => job.role_id === selectedRoleId);
})

onMounted(async () => {
  await fetchJobs()
})
</script>

<style scoped>
.job-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-items: center;
}
</style>
