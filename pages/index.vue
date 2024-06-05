<template>
  <div class="container">
    <Header />
    <div class="job-list">
      <JobCard v-for="job in filteredJobs" :key="job.id" :job="job" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { type Job } from '@/types/interfaces'
import Header from '@/components/Header.vue'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

const jobs = ref<Job[]>([]);
const store = useJsaStore()
const lastRefreshed = ref(Date.now());

const transformDataToJobs = (data: any[]): Job[] => {
  return data.map(item => ({
    id: item.id,
    created_at: item.created_at,
    title: item.title,
    company: item.company,
    short_summary: item.short_summary,
    hard_requirements: item.hard_requirements,
    job_site: item.job_site,
    url: item.url,
    location: item.location,
    date_posted: item.date_posted,
    comp_interval: item.comp_interval,
    comp_min: item.comp_min,
    comp_max: item.comp_max,
    comp_currency: item.comp_currency,
    emails: item.emails,
    description: item.description,
    date_pulled: item.date_pulled,
    user_id: item.user_id,
    user_interested: item.interested,

    overall_score: parseInt(item.score, 10),
    desire_score: parseInt(item.desire_score, 10),
    experience_score: parseInt(item.experience_score, 10),
    meets_requirements_score: parseInt(item.meets_requirements_score, 10),
    meets_experience_score: parseInt(item.meets_experience_score, 10),
  }));
};

const fetchJobs = async () => {
  try {
    const publicUsers = await PersistentDataService.fetchPublicUsers();
    const rawItems = await PersistentDataService.fetchJobsForUsers(publicUsers);
    const items: Job[] = transformDataToJobs(rawItems);

    console.log(items);
    jobs.value = items
      .filter(job => job.overall_score >= 70)
      .sort((a, b) => {
        const dateA = new Date(a.date_posted || a.date_pulled).getTime();
        const dateB = new Date(b.date_posted || b.date_pulled).getTime();
        const dateComparison = dateB - dateA;
        if (dateComparison !== 0) {
          return dateComparison;
        }
        return b.overall_score - a.overall_score;
      });

    lastRefreshed.value = Date.now();
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

const filteredJobs = computed(() => {
  if (store.selectedUserId === null) {
    return jobs.value;
  }
  else {
    return jobs.value.filter(job => job.user_id === store.selectedUserId);
  }
})

onMounted(async () => {
  await fetchJobs()
  const intervalId = setInterval(fetchJobs, 3600000); // Refresh every 60 minutes

  onUnmounted(() => {
    clearInterval(intervalId);
  });
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 0 20px;
  background-color: #607d8b;
}

.job-list {
  margin-top: 24px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  justify-items: center;
}
</style>
