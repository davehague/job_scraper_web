<template>
  <div class="container">
    <Header @filter="handleFilter" />
    <div class="job-list">
      <JobCard v-for="job in visibleJobs" :key="job.id" :job="job" />
    </div>
    <div v-if="visibleJobs.length === 0" class="no-jobs">
      <p>{{ noJobsMessage }} </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { type Job } from '@/types/interfaces'
import Header from '@/components/Header.vue'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

const store = useJsaStore()
const lastRefreshed = ref(Date.now());

const allJobs = ref<Job[]>([]);
const visibleJobs = ref<Job[]>([]);
const noJobsMessage = ref<string>('Loading jobs...');

const intervalId = ref<number>();

const handleFilter = (filterType: string) => {
  switch (filterType) {
    case 'latestSearch':
      visibleJobs.value = allJobs.value.filter(job => job.user_interested == null);
      noJobsMessage.value = 'No jobs found. Is your profile filled out completely? If you\'re still experiencing a problem please contact David!';
      break;
    case 'savedResults':
      visibleJobs.value = allJobs.value.filter(job => job.user_interested != null && job.user_interested);
      noJobsMessage.value = 'No saved jobs found.';
      break;
    case 'viewApplied':
      // TODO: Implement applied
      visibleJobs.value = [];
      noJobsMessage.value = 'No applied jobs found.';
      break;
    case 'viewDiscards':
    visibleJobs.value = allJobs.value.filter(job => job.user_interested != null && !job.user_interested);
    noJobsMessage.value = 'No discarded jobs found.';
      break;
    default:
    visibleJobs.value = allJobs.value;
  }
}

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

const fetchJobs = async (loggedInUserId: string | null) => {
  try {
    let rawItems = [];
    if (loggedInUserId === null) {
      const publicUsers = await PersistentDataService.fetchPublicUsers();
      rawItems = await PersistentDataService.fetchJobsForUsers(publicUsers);
    } else {
      rawItems = await PersistentDataService.fetchJobsForUser(loggedInUserId!);
    }

    lastRefreshed.value = Date.now();
    let jobs = transformDataToJobs(rawItems);
    allJobs.value = jobs.sort((a, b) => {
      const dateA = new Date(a.date_posted || a.date_pulled).getTime();
      const dateB = new Date(b.date_posted || b.date_pulled).getTime();
      return (dateA - dateB) || (b.overall_score - a.overall_score);
    })

    if (loggedInUserId === null) {
      visibleJobs.value = jobs.filter(job => job.user_id === store.selectedUserId);
    } else {
      visibleJobs.value = jobs.filter(job => job.user_id === loggedInUserId);
    }

  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

 watch(() => store.selectedUserId, (newVal) => {
  const loggedInUserId = store.authUser?.id || null;
  if (loggedInUserId !== null) {
    return;
  }

  if (newVal != null) {
    visibleJobs.value = allJobs.value.filter(job => job.user_id === newVal);
  }
});

onUnmounted(() => {
  clearInterval(intervalId.value);
});

onMounted(async () => {
  if (!store.authUser)
    await store.getAuthUser();
  if (!store.dbUser)
    await store.getDBUser();

  const loggedInUserId = store.authUser?.id || null;
  await fetchJobs(loggedInUserId)

  intervalId.value = setInterval(fetchJobs, 3600000); // Refresh every 60 minutes
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  background-color: #fff;
}

.job-list {
  margin: 40px 108px;
  display: grid;
  gap: 48px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-items: center;
}

@media (min-width: 768px) {
  .job-list {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

.no-jobs {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.no-jobs p {
  text-align: center;
  color: #333;
  margin: 0;
  font-size: 16px;
}
</style>