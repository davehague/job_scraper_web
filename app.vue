// pages/app.vue
<template>
  <div>
    <h1>Job Listings</h1>
    <div class="job-list">
      <JobCard v-for="job in jobs" :key="job.id" :job="job" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import JobCard from '~/components/JobCard.vue'
import { type Job } from '~/types/job'


export default defineComponent({
  components: {
    JobCard
  },
  setup() {
    const jobs = ref<Job[]>([])

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

    onMounted(fetchJobs)

    return { jobs }
  }
})
</script>

<style scoped>
.job-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
</style>