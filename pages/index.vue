<template>
  <div class="container">
    <Header @filter="updateVisibleJobs" />
    <div v-if="isOnboarding">
      <div class="spinner-container">
        <span class="spinner"></span>
        <p>{{ loadingMessage }}</p>
        <p class="small-italic">{{ loadingMessageProgress }}</p>
      </div>
    </div>
    <div v-else>
      <div class="job-list" v-if="visibleJobs.length > 0">
        <JobCard v-for="job in visibleJobs" :key="job.id" :job="job" @interestSet="interestUpdatedOnJob" />
      </div>
      <div v-if="visibleJobs.length === 0" class="no-jobs">
        <p>{{ noJobsMessage }} </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { type Job } from '@/types/interfaces'
import Header from '@/components/Header.vue'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';
import { shouldRedirectToOnboarding } from '@/utils/helpers';

const router = useRouter();
const route = useRoute();
const store = useJsaStore();
const lastRefreshed = ref(Date.now());

const isOnboarding = ref(route.query.onboarding !== undefined);
const loadingMessage = ref("We're currently searching, gathering results, and finding your best matches.  They'll load here soon!");
const loadingMessageProgress = ref('Tickling keyboards to wake up job databases...');

const allJobs = ref<Job[]>([]);
const visibleJobs = ref<Job[]>([]);
const noJobsMessage = ref<string>('Loading jobs...');

const intervalId = ref<number>();
const currentFilter = ref<string>('latestSearch');

const updateVisibleJobs = (filterType: string) => {
  currentFilter.value = filterType;
  switch (filterType) {
    case 'latestSearch':
      visibleJobs.value = allJobs.value.filter(job => job.user_interested == null);
      noJobsMessage.value = "We're very sorry, but we weren't able to find any jobs with those parameters. Perhaps more will appear on the next run.  If you're still having trouble please refresh the page or reach out to David!";
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
    date_pulled: item.date_pulled,

    user_id: item.user_id,
    user_interested: item.interested,
    overall_score: parseInt(item.score, 10),
    desire_score: parseInt(item.desire_score, 10),
    experience_score: parseInt(item.experience_score, 10),
    meets_requirements_score: parseInt(item.meets_requirements_score, 10),
    meets_experience_score: parseInt(item.meets_experience_score, 10),
    guidance: item.guidance,
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
      return (dateB - dateA) || (b.overall_score - a.overall_score);
    })

    if (loggedInUserId === null || store.dbUser?.is_admin) {
      visibleJobs.value = allJobs.value.filter(job => job.user_id === store.selectedUserId);
    }
    else {
      visibleJobs.value = allJobs.value.filter(job => job.user_id === loggedInUserId);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

const interestUpdatedOnJob = (jobId: string, interested: boolean | null) => {
  const job = allJobs.value.find(job => job.id === jobId);
  if (job) {
    job.user_interested = interested;
  }
  recalculateVisibleJobs();
}

const recalculateVisibleJobs = () => {
  updateVisibleJobs(currentFilter.value);
  if (!store.authUser && store.selectedUserId != null) {
    visibleJobs.value = allJobs.value.filter(job => job.user_id === store.selectedUserId);
  }
}

watch(() => store.selectedUserId, (newVal) => {
  handleNewUserId(newVal);
});

const handleNewUserId = async (newVal: string) => {
  const loggedInUserId = store.authUser?.id || null;
  if (loggedInUserId !== null && !store.dbUser?.is_admin) {
    return;
  }

  if (store.dbUser?.is_admin) {
    await fetchJobs(newVal);
  }

  if (newVal != null) {
    visibleJobs.value = allJobs.value.filter(job => job.user_id === newVal);
  }
};

onUnmounted(() => {
  clearInterval(intervalId.value);
});

onMounted(async () => {
  if (!store.authUser) await store.getAuthUser();
  if (!store.dbUser) await store.getDBUser();

  if (isOnboarding.value) {
    await fetchJobsRepeatedly();
  } else {
    const userShouldOnboard = await shouldRedirectToOnboarding();
    if (userShouldOnboard) {
      router.push("/onboarding");
    }

    const loggedInUserId = store.authUser?.id || null;
    await fetchJobs(loggedInUserId)
    recalculateVisibleJobs();
    // intervalId.value = setInterval(fetchJobs, 3600000); // Refresh every 60 minutes
  }
})

const fetchJobsRepeatedly = async () => {
  let attempts = 0;
  const waitingMessages = [
    "Getting ready to uncover awesome job opportunities!",
    "Searching the galaxy for the perfect job match...",
    "Polishing the crystal ball for career insights...",
    "Summoning job listings from the digital abyss...",
    "Stirring up a job-hunting potion... Almost done!",
    "Counting down the seconds until new job arrivals...",
    "Sending out job-seeking vibes into cyberspace...",
    "Juggling job listings like a digital circus performer...",
    "Loading job rockets for launch... T-minus...",
    "Unveiling career gems from the job treasure chest...",
    "Tickling keyboards to wake up job databases...",
    "Job search success! Your future career awaits!"
  ];
  const interval = setInterval(async () => {
    if (attempts >= 12) {  // After 2 minutes, stop trying
      clearInterval(interval);
      removeOnboardingParam();
      updateVisibleJobs('latestSearch');
      return;
    }
    attempts++;
    loadingMessageProgress.value = waitingMessages[attempts];
    await fetchJobs(store.authUser?.id || null);
    if (visibleJobs.value.length > 0) {
      clearInterval(interval);
      removeOnboardingParam();
    }
  }, 10000);
};

const removeOnboardingParam = () => {
  isOnboarding.value = false;
  const query = { ...route.query };
  delete query.onboarding;
  router.replace({ query });
};

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

/* Onboarding */
.small-italic {
  font-size: 14px;
  color: #555;
  margin-top: 0;
  font-style: italic;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>