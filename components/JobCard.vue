<!-- components/JobCard.vue -->
<template>
  <div :class="['job-card', { 'older-job': isOlder }]">
    <div class="title-and-score" @click="openDetails">
      <h2 class="title">{{ job.title }}</h2>
      <ScoreCircle :overall_score="job.overall_score" />
    </div>
    <div class="content-container" v-if="showContent">
      <div class="company">
        <span>{{ job.company }}</span>&nbsp;<span v-if="job.location">({{ job.location }})</span>
      </div>
      <div class="job-comp" v-if="job.comp_interval">${{ round(job.comp_min! / 1000) }}k to ${{ round(job.comp_max! /
        1000) }}k</div>

      <div class="job-source">{{ jobRecencyText(job.date_posted, job.date_pulled) }}</div>

      <!-- Summary -->
      <h4>Summary</h4>
      <div v-if="showFullSummary" v-html="renderMarkdown(job.short_summary)"></div>
      <div v-else v-html="renderMarkdown(truncate(job.short_summary, 300))"></div>
      <span class="link-like" @click="toggleSummary">{{ showFullSummary ? '[Show Less]' : '[Show More]' }}</span>

      <!-- Requirements -->
      <h4 class="expandable-section" @click="toggleRequirements">Requirements <span
          v-if="!showRequirements">[Show]</span><span v-else>[Hide]</span>
      </h4>
      <div v-if="showRequirements" v-html="renderMarkdown(job.hard_requirements)"></div>
    </div>

    <!-- Job link -->
    <div class="link-to-job" @click.prevent="openJobInBrowser(job.url)" @keydown.enter="openJobInBrowser(job.url)"
      tabindex="0">
      <a :href="job.url" @click.prevent>View Job</a>
      <i class="fas fa-external-link-alt"></i>
    </div>

    <!-- Action buttons -->
    <div v-if="userLoggedIn">
      <JobActionButtons :job="job" @interestUpdated="interestUpdated" @appliedUpdated="appliedUpdated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type PropType } from 'vue';
import { useRouter } from 'vue-router'
import type { Job } from '@/types/interfaces';
import { renderMarkdown } from '@/utils/helpers';
import { useJsaStore } from '@/stores/jsaStore'
import { jobRecencyText } from '@/utils/helpers';

const { $mixpanel } = useNuxtApp() as any;

const props = defineProps({
  job: {
    type: Object as PropType<Job>,
    required: true
  }
});

const store = useJsaStore();
const router = useRouter();
const userLoggedIn = store.authUser !== null;
const showRequirements = ref(true);
const showFullSummary = ref(false);
const showContent = ref(true);

const emits = defineEmits(['interestUpdated', 'appliedUpdated']);

onMounted(async () => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (window.innerWidth > 768) {
    showContent.value = true;
  }
};

const openDetails = () => {
  router.push(`/job/${props.job.id}`);
};

const toggleRequirements = () => {
  showRequirements.value = !showRequirements.value;
};

const toggleSummary = () => {
  showFullSummary.value = !showFullSummary.value;
};

const interestUpdated = (jobId: string, interested: boolean | null) => {
  emits('interestUpdated', jobId, interested);
};

const appliedUpdated = (jobId: string, hasApplied: boolean) => {
  emits('appliedUpdated', jobId, hasApplied);
};

const truncate = (text: string, length: number) => {
  if (text && text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};

const round = (value: number) => {
  return Math.round(value);
};

const openJobInBrowser = (url: string) => {
  $mixpanel.track('Job clicked', { job_id: props.job.id, job_url: props.job.url, job_site: props.job.job_site });
  window.open(url, '_blank', 'noopener,noreferrer');
};

const isOlder = () => {
  const todayDate = new Date().toISOString().split('T')[0];
  return props.job.date_posted < todayDate || props.job.date_pulled < todayDate;
};
</script>

<style scoped>
.job-card {
  flex: 1 1 400px;
  max-width: 500px;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 24px;
  box-sizing: border-box;
  box-shadow: 4px 4px 20px 0px rgba(0, 0, 0, 0.2);
  overflow: visible;
}

.job-card.older-job {
  background-color: #F5F5F5;
}

@media (max-width: 768px) {
  .job-card h2 {
    cursor: pointer;
  }
}

.title-and-score {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  cursor: pointer;
}

.title {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  width: 80%;
  cursor: pointer;
}

.title:hover {
  text-decoration: underline;
}

.content-container {
  flex-grow: 1;
}

.company,
.job-comp {
  font-size: 20px;
  font-weight: 400;
  color: #040913;
}

.job-source {
  margin: 16px 0;
  font-size: 16px;
}

.job-card a {
  color: #007bff;
  text-decoration: none;
  margin: 10px 0;
}

.job-card a:hover {
  text-decoration: underline;
}

.job-card h4 {
  margin: 16px 0;
}

.job-card h4 span {
  font-weight: normal;
  font-size: 0.8em;
  color: #333;
  text-decoration: underline;
}

.link-like {
  margin-top: 0px;
  font-size: 0.8em;
  color: #333;
  cursor: pointer;
  text-decoration: underline;
}

.job-card .link-like:hover {
  text-decoration: none;
}

.expandable-section {
  cursor: pointer;
}

.link-to-job {
  display: flex;
  gap: 8px;
  justify-content: start;
  align-items: center;
  cursor: pointer;
}

.save-button,
.discard-button {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;

  border: 1px solid #ccc;
}

.job-card .icon-saved-active {
  color: red;
}

.job-card .icon-discarded-active {
  color: #000;
}
</style>
